import type { Metadata } from 'next'
import AdminAuthGate from './admin-auth-gate'
import { getAdminSession } from '../../lib/admin-auth'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // The gate only decides what the browser shows. Authorization is enforced
  // server-side: the page, every admin action and /api/admin/* re-check the
  // session cookie against ADMIN_EMAILS on each request.
  const session = await getAdminSession()
  return (
    <AdminAuthGate sessionEmail={session.ok ? session.admin.email : null}>
      {children}
    </AdminAuthGate>
  )
}
