import AuthGate from '../../components/auth-gate'

export default function ScorecardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGate title="SCORECARD" subtitle="Sign in to access the Scorecard.">
      {children}
    </AuthGate>
  )
}
