import Image from 'next/image'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]/route';
import UserAuth from '@/components/UserAuth';


export default async function Home() {

  const session = await getServerSession(authOptions);
  console.log(session)
  return (
  <div>
      <h2>RadioEscola</h2>
      <UserAuth />
      {session && (
        <div>
          <p>Server - Signed in as {session.user && session.user.email|| session.user && session.user.name }</p>
          <a href="/api/auth/signout">Sign out by link</a>
        </div>
      )}

      {!session && (
        <p>Not signed in</p>
      )}

    </div>
  )
}
