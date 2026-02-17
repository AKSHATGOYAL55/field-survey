import { AuthLayout } from "@/components/auth/auth-layout"
import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Get started with SurveyFlow in seconds. No credit card required."
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/login"
    >
      <SignupForm />
    </AuthLayout>
  )
}
