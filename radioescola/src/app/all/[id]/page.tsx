import { PrismaClient } from '.prisma/client'

  import QuestionCard from './questionCard'
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

export default async function AllQuestions({ params }: { params: { id: number } }) {
  const questions = await getAllQuestions(params.id)
  return (
    <div>
    <ol className='list-decimal'>

    {questions.map((question) => {
      return (
    <QuestionCard question={question} />
      )  
    })}
    </ol>
    </div>
  ) 
}
