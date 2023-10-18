import React from 'react'
import { PrismaClient } from '.prisma/client'


function getRandomQuestion(categoria : number){
    const prisma = new PrismaClient()
    const questions = prisma.pergunta.findMany({
      where: {categoria: Number(categoria)},
      include: {
        resposta: true,
      }
    })

  return questions
}

export default async function QuizGenerator({ params }: { params: { id: number } }) {
  const questions = await getRandomQuestion(params.id)
  return (
    <div>
        QuizGenerator
    <br/>
    {questions.map(question => {
    return (
      <li key={question.id}>
        {question.pergunta}
      </li>
    )
  })}

    </div>
  )
}
