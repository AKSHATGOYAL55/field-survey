import { AuthLayout } from "@/components/auth/auth-layout"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your SurveyFlow account to continue."
      footerText="Don't have an account?"
      footerLinkText="Create one"
      footerLinkHref="/signup"
    >
      <LoginForm />
    </AuthLayout>
  )
}
