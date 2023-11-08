'use server'
import { Prisma, PrismaClient } from '@prisma/client'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function create(prevState: any, formData: FormData) {
    const prisma = new PrismaClient()

    if (formData.get("fonte") !== null) 
        fonte = formData.get("fonte").toString() 

    const questions = prisma.fonte.create({data: {
        fonte: fonte
    }})
   //TODO: add remaining fields
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
    }
    

    // await new Promise(resolve => setTimeout(resolve, 1000));
    return {message: "Sent!"}
  }