"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { KYCForm } from "@/components/auth/kyc-form"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function KYCPage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [canSubmit, setCanSubmit] = useState(false)

  useEffect(() => {
    const checkKYCStatus = async () => {
      const userId = sessionStorage.getItem("userId")
      
      if (!userId) {
        router.push("/login")
        return
      }

      try {
        const res = await fetch(`/api/auth/check-kyc?userId=${userId}`)
        const data = await res.json()

        if (res.ok) {
          // If KYC already exists, redirect to dashboard
          if (data.role === "SURVEYOR" && data.hasKYC === true) {
            router.push("/surveyor")
            return
          }
          
          // Only SURVEYOR users can access KYC page
          if (data.role !== "SURVEYOR") {
            router.push("/login")
            return
          }

          setCanSubmit(true)
        }
      } catch (error) {
        console.error("Error checking KYC:", error)
      } finally {
        setIsChecking(false)
      }
    }

    checkKYCStatus()
  }, [router])

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!canSubmit) {
    return null
  }

  return (
    <AuthLayout
      title="Complete Your KYC"
      subtitle="Please provide your details to complete the verification process."
      footerText="Already completed?"
      footerLinkText="Go to dashboard"
      footerLinkHref="/surveyor"
    >
      <KYCForm />
    </AuthLayout>
  )
}
