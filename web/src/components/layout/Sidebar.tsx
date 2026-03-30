import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const links = [
  { to: '/dashboard',               label: 'Overview'       },
  { to: '/dashboard/agents',        label: 'Agents'         },
  { to: '/dashboard/cloud-accounts', label: 'Cloud Accounts' },
]

export default function Sidebar() {
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
      </nav>
    </aside>
  )
}
