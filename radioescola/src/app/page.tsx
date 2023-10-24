import Image from 'next/image'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]/route';
import UserAuth from '@/components/UserAuth';


export default async function Home() {

  const session = await getServerSession(authOptions);
  return (
  <div>
      <h2>RadioEscola</h2>

    </div>
  )
}
