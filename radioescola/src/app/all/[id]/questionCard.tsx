'use client'

import { Pergunta, Prisma, PrismaClient, Resposta } from '@prisma/client';
import React, { ReactNode } from 'react'

const perguntaWithRespostas = Prisma.validator<Prisma.PerguntaDefaultArgs>()({
  include: { resposta: true },
})

type PerguntaWithRespostas = Prisma.PerguntaGetPayload<typeof perguntaWithRespostas>




export default function QuestionCard({ question, check }: {question: PerguntaWithRespostas, check: Boolean}) {
  let [resultado, setResultado] = React.useState<Number>(-1)
  let [selected, setSelected] = React.useState<String>("")

  let correta : String = ""
  function componentDidUpdate(){
    if (check === true) {
      checkAnswers()
      check = false;
    }
  }

function checkAnswers(){

}

  function checkAnswer(event: React.MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).id === correta) { 
      setResultado(1) 
    } else {
      setResultado(0)
    }
    setSelected((event.target as HTMLElement).id)
    return true
  }

  return (
          <li key={question.id} className='my-5 p-5 border bg-gray-300 rounded-md border-gray-500'>
            {question.pergunta} 
            <ul className='list-disc'>
            {question.resposta.map(resposta => {
            if (resposta.correta) correta = String(resposta.id)
            return (
              <li key={resposta.id} id={String(resposta.id)} onClick={e => checkAnswer(e)} className={selected == String(resposta.id) ? "bg-blue-500" : ""}>
                {resposta.resposta} 
              </li>
            )
            })}
          </ul>
          <span className={`whitespace-pre ${resultado == 1 ? 'bg-green-400' : ''} ${resultado == 0 ? 'bg-red-500' : ''}`}>{resultado == 1 ? "Resposta Certa!" : ''} { resultado == 0 ? "Resposta Errada!" : '' } </span>
          </li>
        )
      
}

