import { NavLink } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { cn } from '@/lib/utils'

const ADMIN_EMAILS = ['jhcobo001@gmail.com']

const links = [
  { to: '/dashboard',                label: 'Overview'       },
  { to: '/dashboard/agents',         label: 'Agents'         },
  { to: '/dashboard/cloud-accounts', label: 'Cloud Accounts' },
  { to: '/dashboard/guides',         label: 'API Key Guides' },
]

export default function Sidebar() {
  const { user } = useUser()
  const isAdmin = ADMIN_EMAILS.includes(user?.primaryEmailAddress?.emailAddress ?? '')

  return (
    <aside className="w-52 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800 font-bold text-lg tracking-tight">
        Adaimade
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/dashboard'}
            className={({ isActive }) =>
              cn(
                'block px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800',
              )
            }
          >
            {link.label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Admin</p>
            </div>
            <NavLink
              to="/dashboard/admin"
              className={({ isActive }) =>
                cn(
                  'block px-3 py-2 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-brand-500 text-white'
                    : 'text-gray-500 hover:text-white hover:bg-gray-800',
                )
              }
            >
              ⚙️ Platform Admin
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  )
}
