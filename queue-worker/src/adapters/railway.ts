/*
 * Railway Adapter
 * Deploys the Discord bot as a Railway service via their GraphQL API.
 * Docs: https://docs.railway.app/reference/public-api
 */

const RAILWAY_GQL = 'https://backboard.railway.app/graphql/v2'

type RailwayCreds = { api_token: string }

async function gql(token: string, query: string, variables: Record<string, unknown> = {}) {
  const res = await fetch(RAILWAY_GQL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  })
  const data: any = await res.json()
  if (data.errors) throw new Error(data.errors[0].message)
  return data.data
}

export async function deploy(
  imageUri: string,
  agentId: string,
  envVars: Record<string, string>,
  creds: RailwayCreds,
): Promise<{ externalId: string; externalUrl: string | null }> {
  const projectName = `agent-${agentId.slice(0, 8)}`

  // 1. Create project
  const projectResult = await gql(creds.api_token, `
    mutation CreateProject($name: String!) {
      projectCreate(input: { name: $name }) {
        id
        environments {
          edges { node { id } }
        }
      }
    }
  `, { name: projectName })

  const project = projectResult.projectCreate
  const environmentId = project.environments.edges[0]?.node?.id
  if (!environmentId) throw new Error('No environment found in created project')

  // 2. Create service with Docker image
  const serviceResult = await gql(creds.api_token, `
    mutation CreateService($projectId: String!, $name: String!, $image: String!) {
      serviceCreate(input: {
        projectId: $projectId,
        name: $name,
        source: { image: $image }
      }) {
        id
      }
    }
  `, {
    projectId: project.id,
    name: 'discord-bot',
    image: imageUri,
  })

  const serviceId = serviceResult.serviceCreate.id

  // 3. Set environment variables
  await gql(creds.api_token, `
    mutation SetVars(
      $projectId: String!,
      $serviceId: String!,
      $environmentId: String!,
      $variables: EnvironmentVariables!
    ) {
      variableCollectionUpsert(input: {
        projectId: $projectId,
        serviceId: $serviceId,
        environmentId: $environmentId,
        variables: $variables
      })
    }
  `, {
    projectId: project.id,
    serviceId,
    environmentId,
    variables: envVars,
  })

  // 4. Trigger deployment
  await gql(creds.api_token, `
    mutation Deploy($serviceId: String!, $environmentId: String!) {
      serviceInstanceDeploy(serviceId: $serviceId, environmentId: $environmentId)
    }
  `, { serviceId, environmentId })

  return { externalId: serviceId, externalUrl: null }
}

export async function destroy(externalId: string, creds: RailwayCreds): Promise<void> {
  await gql(creds.api_token, `
    mutation DeleteService($id: String!) {
      serviceDelete(id: $id)
    }
  `, { id: externalId })
}
