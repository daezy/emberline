import { useMutation } from '@tanstack/react-query'
import {
  Link,
  Outlet,
  useNavigate,
  useRouteContext,
  useRouterState,
} from '@tanstack/react-router'
import { useEffect } from 'react'

import iconUrl from '#/assets/icons/emberline-mark.png'
import { signOut } from '#/components/auth/auth-api'
import { AuthStoreProvider, useSessionUser } from '#/stores/auth-store-provider'
import { useUiStore } from '#/stores/ui-store'

import {
  Activity,
  Bell,
  CircleHelp,
  Flame,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Server,
  Settings,
  X,
} from './icons'

const navigation = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Services', to: '/dashboard/services', icon: Server },
  { label: 'Activity', to: '/dashboard/activity', icon: Activity },
]

function initialsOf(name: string | null, email: string) {
  const source = name?.trim() || email
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export function DashboardLayout() {
  const { user } = useRouteContext({ from: '/dashboard' })

  return (
    <AuthStoreProvider user={user}>
      <DashboardShell />
    </AuthStoreProvider>
  )
}

function DashboardShell() {
  const user = useSessionUser()
  const navigate = useNavigate()
  const signOutMutation = useMutation({
    mutationFn: signOut,
    onSuccess: () => navigate({ to: '/auth/sign-in' }),
  })
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const mobileOpen = useUiStore((state) => state.mobileNavOpen)
  const openMobileNav = useUiStore((state) => state.openMobileNav)
  const closeMobileNav = useUiStore((state) => state.closeMobileNav)

  useEffect(() => closeMobileNav(), [pathname, closeMobileNav])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#dashboard-content">
        Skip to content
      </a>
      <div
        className={`dashboard-scrim ${mobileOpen ? 'is-open' : ''}`}
        onClick={closeMobileNav}
        aria-hidden="true"
      />
      <aside className={`app-sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="sidebar-brand-row">
          <Link className="app-brand" to="/dashboard">
            <img src={iconUrl} alt="" />
            <span>emberline</span>
          </Link>
          <button
            className="icon-button sidebar-close"
            type="button"
            onClick={closeMobileNav}
            aria-label="Close navigation"
          >
            <X size={17} />
          </button>
        </div>

        <Link className="add-service-button" to="/dashboard/services/new">
          <Plus size={16} />
          Add service
        </Link>

        <nav className="app-nav" aria-label="Dashboard navigation">
          <span className="nav-label">Workspace</span>
          {navigation.map(({ label, to, icon: Icon, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to)
            return (
              <Link key={to} className={active ? 'is-active' : ''} to={to}>
                <Icon size={17} strokeWidth={1.8} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-divider" />
        <div className="workspace-summary">
          <div className="workspace-summary__head">
            <span>Free plan</span>
            <span>4 / 5</span>
          </div>
          <div className="workspace-meter">
            <span />
          </div>
          <p>1 service slot remaining</p>
        </div>

        <nav className="app-nav sidebar-bottom" aria-label="Account navigation">
          <Link
            className={pathname === '/dashboard/settings' ? 'is-active' : ''}
            to="/dashboard/settings"
          >
            <Settings size={17} strokeWidth={1.8} />
            Settings
          </Link>
          <a href="mailto:hello@emberline.dev">
            <CircleHelp size={17} strokeWidth={1.8} />
            Help & feedback
          </a>
          <button
            type="button"
            disabled={signOutMutation.isPending}
            onClick={() => signOutMutation.mutate()}
          >
            <LogOut size={17} strokeWidth={1.8} />
            {signOutMutation.isPending ? 'Signing out…' : 'Sign out'}
          </button>
        </nav>

        <div className="account-switcher">
          <span className="avatar">{initialsOf(user.name, user.email)}</span>
          <div>
            <strong>{user.name ?? user.email}</strong>
            {user.name && <small>{user.email}</small>}
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <button
            className="icon-button mobile-menu"
            type="button"
            onClick={openMobileNav}
            aria-label="Open navigation"
          >
            <Menu size={19} />
          </button>
          <div className="environment-badge">
            <Flame size={13} /> All systems warm
          </div>
          <div className="topbar-actions">
            <button
              className="icon-button"
              type="button"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
            <span className="topbar-rule" />
            <span className="topbar-workspace">Personal workspace</span>
          </div>
        </header>
        <main id="dashboard-content" className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
