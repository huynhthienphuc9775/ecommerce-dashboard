import { Route, Routes } from 'react-router-dom'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { RequireGuest } from '@/components/auth/RequireGuest'
import { AuthLayout } from '@/layouts/AuthLayout'
import { MainLayout } from '@/layouts/MainLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { HomePage } from '@/pages/HomePage'
import { InvitationsPage } from '@/pages/InvitationsPage'
import { UsersPage } from '@/pages/UsersPage'

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
        <Route path="/admin" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="invitations" element={<InvitationsPage />} />
          <Route path="users" element={<UsersPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
