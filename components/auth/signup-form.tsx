"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { User, Mail, Lock } from "lucide-react"
import { AuthInput } from "./auth-input"
import { RoleSelector, type Role } from "./role-selector"

export function SignupForm() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    if (!role) {
      alert("Please select a role")
      return
    }
  
    if (password !== confirmPassword) {
      alert("Passwords do not match")
      return
    }
  
    console.log("start")
    setIsLoading(true)
  
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          role,
        }),
      })
  
      const data = await res.json()
  
      if (!res.ok) {
        alert(data.error)
      } else {
        alert("Account created successfully!")
        window.location.href = "/login"
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
          id="fullName"
          label="Full name"
          value={fullName}
          onChange={setFullName}
          placeholder="John Doe"
          delay={0.2}
          icon={<User className="h-4 w-4" />}
        />

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
          placeholder="Create a password"
          delay={0.3}
          icon={<Lock className="h-4 w-4" />}
        />

        <AuthInput
          id="confirmPassword"
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Confirm your password"
          delay={0.35}
          icon={<Lock className="h-4 w-4" />}
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-foreground/80">
            Select your role
          </label>
          <RoleSelector value={role} onChange={setRole} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
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
              <span>Creating account...</span>
            </motion.div>
          ) : (
            <span>Create account</span>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/5 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />
        </motion.button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 text-center text-xs text-muted-foreground"
      >
        {"By creating an account, you agree to our "}
        <button type="button" className="text-primary transition-colors hover:text-primary/80">
          Terms of Service
        </button>
        {" and "}
        <button type="button" className="text-primary transition-colors hover:text-primary/80">
          Privacy Policy
        </button>
      </motion.p>
    </form>
  )
}
