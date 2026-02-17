"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Shield, Users, ClipboardList } from "lucide-react"

const roles = [
  {
    id: "admin",
    label: "Admin",
    description: "Full platform access",
    icon: Shield,
  },
  {
    id: "manager",
    label: "Manager",
    description: "Team management",
    icon: Users,
  },
  {
    id: "surveyor",
    label: "Surveyor",
    description: "Field operations",
    icon: ClipboardList,
  },
] as const

export type Role = (typeof roles)[number]["id"]

interface RoleSelectorProps {
  value: Role | null
  onChange: (role: Role) => void
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {roles.map((role, index) => {
        const isSelected = value === role.id
        const Icon = role.icon
        return (
          <motion.button
            key={role.id}
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(role.id)}
            className={cn(
              "relative flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3.5 text-center transition-all duration-200",
              isSelected
                ? "border-primary/50 bg-primary/10 text-foreground shadow-sm shadow-primary/10"
                : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-border hover:bg-secondary/50"
            )}
          >
            {isSelected && (
              <motion.div
                layoutId="role-indicator"
                className="absolute inset-0 rounded-xl border border-primary/50 bg-primary/5"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <Icon className={cn("relative z-10 h-5 w-5", isSelected ? "text-primary" : "text-muted-foreground")} />
            <span className="relative z-10 text-xs font-semibold">{role.label}</span>
            <span className="relative z-10 hidden text-[10px] leading-tight text-muted-foreground sm:block">
              {role.description}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
