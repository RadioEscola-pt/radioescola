'use client'
import { useSession } from "next-auth/react"

export default function UserAuth() {
  const { data: session, status } = useSession()

  if (status === "authenticated") {
    return <p>Client - Signed in as {session.user && session.user.email}</p>
  }

  return <a href="/api/auth/signin">Sign in</a>
}