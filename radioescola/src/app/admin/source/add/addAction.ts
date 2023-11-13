'use server'
import { Prisma, PrismaClient } from '@prisma/client'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function create(prevState: any, formData: FormData) {
    const prisma = new PrismaClient()

    let fonte : string = ""
    let categoria = 1
    let link = ""

    fonte  = formData.get("exam")!.toString() 
    categoria = Number(formData.get("categoria")!)

    const file: File | null = formData.get('ficheiro') as File
    if (file.size == 0 && file.name == "undefined") {
        console.log("no file selected")
    } else {
        console.log("dealing with file")
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const path = join('/', 'tmp/', 'exam',  file.name)
        await writeFile(path, buffer)
        console.log(`open ${path} to see the uploaded file`)
        link = path
    }
    const questions = await prisma.fonte.create({data: {
        fonte: fonte,
        categoria: categoria,
        link: link
    }})

    return {message: "Sent!"}
  }