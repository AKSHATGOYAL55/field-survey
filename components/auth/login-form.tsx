"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Lock } from "lucide-react"
import { AuthInput } from "./auth-input"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
  
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })
  
      const data = await res.json()
  
      if (!res.ok) {
        alert(data.error)
      } else {
        // Store user ID in sessionStorage for all users
        sessionStorage.setItem("userId", data.user.id)
        
        // Role based redirect with KYC check for SURVEYOR
        if (data.role === "ADMIN") {
          window.location.href = "/admin"
        } else if (data.role === "MANAGER") {
          window.location.href = "/manager"
        } else if (data.role === "SURVEYOR") {
          // Check if KYC is completed
          if (data.hasKYC === false) {
            window.location.href = "/kyc"
          } else {
            window.location.href = "/surveyor"
          }
        } else {
          window.location.href = "/surveyor"
        }
      }
    } catch (error) {
      alert("Something went wrong")
    }
  
    setIsLoading(false)
  }
  

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <AuthInput
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="name@company.com"
          delay={0.25}
          icon={<Mail className="h-4 w-4" />}
        />

        <AuthInput
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          delay={0.3}
          icon={<Lock className="h-4 w-4" />}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-2 flex justify-end"
      >
        <button
          type="button"
          className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          Forgot password?
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={isLoading}
          className="relative flex h-11 w-full items-center justify-center overflow-hidden rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 disabled:opacity-70"
        >
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              <span>Signing in...</span>
            </motion.div>
          ) : (
            <span>Sign in</span>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/5 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />
        </motion.button>
      </motion.div>
    </form>
  )
}
