/*
 * Zeabur Adapter
 * Deploys the Discord bot as a Zeabur service via their GraphQL API.
 */

const ZEABUR_GQL = 'https://api.zeabur.com/graphql'

type ZeaburCreds = { api_token: string; region?: string }

async function gql(token: string, query: string, variables: Record<string, unknown> = {}) {
  const res = await fetch(ZEABUR_GQL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  })
  const text = await res.text()
  let data: any
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`Zeabur API error (HTTP ${res.status}): ${text.slice(0, 300)}`)
  }
  if (data.errors) throw new Error(data.errors[0].message)
  return data.data
}

export async function deploy(
  imageUri: string,
  agentId: string,
  envVars: Record<string, string>,
  creds: ZeaburCreds,
): Promise<{ externalId: string; externalUrl: string | null }> {
  const projectName = `agent-${agentId.slice(0, 8)}`
  const region = (creds as any).region ?? 'server-6999a78ed8f431e39b95c5a9'

  // 1. Create project
  const projectResult = await gql(creds.api_token, `
    mutation CreateProject($name: String!, $region: String!) {
      createProject(name: $name, region: $region) {
        _id
        environments { _id }
      }
    }
  `, { name: projectName, region })

  const projectId = projectResult.createProject._id
  const environmentId = projectResult.createProject.environments[0]?._id

  // 2. Create service with Docker image
  // Derive a friendly service name from the image (e.g. "ghcr.io/adaimade/hydrabot:v11" → "hydrabot")
  const serviceName = imageUri.split('/').pop()?.split(':')[0] ?? 'bot'

  const serviceResult = await gql(creds.api_token, `
    mutation CreatePrebuiltService($projectID: ObjectID!, $schema: ServiceSpecSchemaInput!) {
      createPrebuiltService(projectID: $projectID, schema: $schema) {
        _id
        name
      }
    }
  `, {
    projectID: projectId,
    schema: {
      name: serviceName,
      source: { image: imageUri },
    },
  })

  const serviceId = serviceResult.createPrebuiltService._id

  // 3. Set environment variables
  await gql(creds.api_token, `
    mutation UpdateEnvVars($environmentID: ObjectID!, $serviceID: ObjectID!, $data: Map!) {
      updateEnvironmentVariable(environmentID: $environmentID, serviceID: $serviceID, data: $data)
    }
  `, {
    environmentID: environmentId,
    serviceID: serviceId,
    data: envVars,
  })

  // 4. Restart service so container picks up env vars
  // (Zeabur starts the container immediately on service creation before env vars are set)
  try {
    await new Promise(r => setTimeout(r, 2000)) // wait for env vars to propagate
    await gql(creds.api_token, `
      mutation Restart($serviceID: ObjectID!, $environmentID: ObjectID!) {
        restartService(serviceID: $serviceID, environmentID: $environmentID)
      }
    `, {
      serviceID: serviceId,
      environmentID: environmentId,
    })
  } catch (_) {
    // Non-fatal: container will still pick up env vars on next crash-restart
  }

  return { externalId: `${projectId}:${serviceId}`, externalUrl: null }
}

export async function destroy(externalId: string, creds: ZeaburCreds): Promise<void> {
  const projectId = externalId.split(':')[0]
  await gql(creds.api_token, `
    mutation DeleteProject($id: String!) { deleteProject(id: $id) }
  `, { id: projectId })
}
