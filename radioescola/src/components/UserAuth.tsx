'use client'
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function UserAuth() {
  const { data: session, status } = useSession()

  if (status === "authenticated") {
    return <p>Bem-vindo {session.user && session.user.email} - <Link href="/api/auth/signout">Terminar sessão</Link></p>
  }

  return <a href="/api/auth/signin">Iniciar sessão</a>
}