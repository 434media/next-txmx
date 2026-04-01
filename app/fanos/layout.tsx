import AuthGate from '../../components/auth-gate'

export default function FanosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGate title="FanOS" subtitle="Sign in to access the FanOS deck.">
      {children}
    </AuthGate>
  )
}
