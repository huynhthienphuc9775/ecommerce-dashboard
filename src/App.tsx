import { Route, Routes } from 'react-router-dom'
import { RequireAuth } from '@/components/shared/RequireAuth'
import { RequireGuest } from '@/components/shared/RequireGuest'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { CategoriesPage } from '@/pages/admin/CategoriesPage'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import { EventsPage } from '@/pages/admin/EventsPage'
import { HomePage } from '@/pages/public/HomePage'
import { InvitationsPage } from '@/pages/admin/InvitationsPage'
import { UsersPage } from '@/pages/admin/UsersPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route element={<RequireGuest />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>
      <Route element={<RequireAuth />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="invitations" element={<InvitationsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="users" element={<UsersPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
