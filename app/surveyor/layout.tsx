"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function SurveyorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check if userId exists in sessionStorage
    const userId = sessionStorage.getItem("userId")
    
    if (!userId) {
      // No user session, redirect to login
      router.push("/login")
      return
    }

    // Check KYC status
    const checkKYC = async () => {
      try {
        const res = await fetch(`/api/auth/check-kyc?userId=${userId}`)
        const data = await res.json()

        if (res.ok) {
          if (data.role === "SURVEYOR" && !data.hasKYC) {
            // KYC not completed, redirect to KYC page
            router.push("/kyc")
            return
          }
        }
      } catch (error) {
        console.error("Error checking KYC:", error)
      } finally {
        setIsChecking(false)
      }
    }

    checkKYC()
  }, [router])

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
