'use server'
import { PrismaClient } from '@prisma/client'
import React from 'react'
import SourcesList from './sourcesList'
import Link from 'next/link'


async function getAllSources(){
    const prisma = new PrismaClient()
    const sources = prisma.fonte.findMany()
  return sources
}

export default async function page() {
const sources = await getAllSources()


  return (
    <div>

        <SourcesList sources = {sources} />
        <Link href="/admin/question/">Listar Questões</Link>
        &nbsp;
        <Link href="/admin/source/add">Adicionar Fonte</Link>

        </div>
    )

    }    
  

