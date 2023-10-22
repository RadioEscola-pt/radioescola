import { PrismaClient } from '.prisma/client'
import AllQuestions from './allQuestions'


async function getAllQuestions(categoria : number){

      const prisma = new PrismaClient()
      const questions = prisma.pergunta.findMany({
        where: {categoria: Number(categoria)},
        include: {
          resposta: true,
        },
      })
    return questions
  }

export default async function Quest({ params }: { params: { id: number } }) {
  const questions = await getAllQuestions(params.id)

  let checkAnswers: Boolean = false
  return (
    <div>
        <AllQuestions question = {questions} />
    </div>
  ) 
}
