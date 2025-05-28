"use client";

import { useUser } from "@/lib/context/UserContext"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const router = useRouter()
  const user = useUser()

  if (!user) {
    console.log("No user found, redirecting to login")
    router.replace("/")
    return null
  }
  console.log(user)
  return ("you are " + user.username)
}