"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, CreditCard, Phone, MapPin } from "lucide-react"
import { AuthInput } from "./auth-input"

export function KYCForm() {
  const [userId, setUserId] = useState<string>("")
  const [aadharName, setAadharName] = useState("")
  const [aadharNumber, setAadharNumber] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [address, setAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get userId from sessionStorage (set during login)
  useEffect(() => {
    const storedUserId = sessionStorage.getItem("userId")
    if (storedUserId) {
      setUserId(storedUserId)
    } else {
      setError("User session not found. Please login again.")
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!userId) {
      setError("User session not found. Please login again.")
      return
    }

    if (!aadharName.trim()) {
      setError("Aadhar name is required")
      return
    }

    if (!aadharNumber.trim() || aadharNumber.length !== 12) {
      setError("Aadhar number must be exactly 12 digits")
      return
    }

    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      setError("Phone number must be at least 10 digits")
      return
    }

    if (!address.trim()) {
      setError("Address is required")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/kyc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          aadharName: aadharName.trim(),
          aadharNumber: aadharNumber.trim(),
          phoneNumber: phoneNumber.trim(),
          address: address.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to submit KYC")
      } else {
        // Clear session storage
        sessionStorage.removeItem("userId")
        alert("KYC submitted successfully!")
        window.location.href = "/surveyor"
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
      console.error("KYC submission error:", error)
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </motion.div>
      )}

      <div className="space-y-4">
        <AuthInput
          id="aadharName"
          label="Aadhar Name"
          value={aadharName}
          onChange={setAadharName}
          placeholder="Enter name as on Aadhar card"
          delay={0.1}
          icon={<User className="h-4 w-4" />}
        />

        <AuthInput
          id="aadharNumber"
          label="Aadhar Number"
          value={aadharNumber}
          onChange={(value) => {
            // Only allow digits and limit to 12
            const digitsOnly = value.replace(/\D/g, "").slice(0, 12)
            setAadharNumber(digitsOnly)
          }}
          placeholder="Enter 12-digit Aadhar number"
          delay={0.15}
          icon={<CreditCard className="h-4 w-4" />}
        />

        <AuthInput
          id="phoneNumber"
          label="Phone Number"
          value={phoneNumber}
          onChange={(value) => {
            // Only allow digits
            const digitsOnly = value.replace(/\D/g, "").slice(0, 15)
            setPhoneNumber(digitsOnly)
          }}
          placeholder="Enter phone number"
          delay={0.2}
          icon={<Phone className="h-4 w-4" />}
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="space-y-2"
        >
          <label
            htmlFor="address"
            className="text-sm font-medium text-foreground/80"
          >
            Address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-3 text-muted-foreground">
              <MapPin className="h-4 w-4" />
            </div>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your complete address"
              rows={3}
              className="flex w-full rounded-lg border border-border/50 bg-secondary/30 px-3 py-2 pl-10 text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary/50 focus:bg-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={isLoading || !userId}
          className="relative flex h-11 w-full items-center justify-center overflow-hidden rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 disabled:opacity-70"
        >
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              <span>Submitting KYC...</span>
            </motion.div>
          ) : (
            <span>Submit KYC</span>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/5 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />
        </motion.button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-4 text-center text-xs text-muted-foreground"
      >
        This information is required for verification purposes. All data is secure and confidential.
      </motion.p>
    </form>
  )
}
