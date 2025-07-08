"use client"

import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { LogOut } from "lucide-react"
import { toast } from "react-hot-toast"

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("token")
    toast.success("Logged out successfully")
    router.push("/login")
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2 bg-transparent">
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Logout</span>
    </Button>
  )
}
