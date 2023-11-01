'use client'

import { useGlobalContext } from '@/context';
import { Prisma} from '@prisma/client';
import React, { useEffect, useState } from 'react'

const perguntaWithRespostas = Prisma.validator<Prisma.PerguntaDefaultArgs>()({
  include: { resposta: true },
})

type PerguntaWithRespostas = Prisma.PerguntaGetPayload<typeof perguntaWithRespostas>


export default function QuestionCard({ question, check, mode }: { question: PerguntaWithRespostas, check: Boolean, mode: String}) {
  let [resultado, setResultado] = React.useState<Number>(-1)
  let [selected, setSelected] = React.useState<String>("")
  let {score, setScore} = useGlobalContext() //score state
  let correta: String = ""
  let [checked, setChecked] = useState<Boolean>(false)

  //check if parent asked to check the answers
  useEffect(() => {
    if (check === true) {
      checkAnswers()
      check = false;
    }
  }, [check])


  //check all answers
  function checkAnswers() {
    //setContext((current) => ( current + 1 )) //Score may not be needed in this case
    if (selected == correta)
      setResultado(1)
    else
      setResultado(0)
  }

  //OnClick answer
  function clickAnswer(event: React.MouseEvent<HTMLElement>) {
    if (mode == "all")  {
      if ((event.target as HTMLElement).id === correta) {
        setResultado(1)
        !checked ? setScore((current) => ( current + 1 )) : true
      } else {
        !checked ? setScore((current) => ( current - 1 )) : true
        setResultado(0)
      }
      setChecked(true)
    } 
    setSelected((event.target as HTMLElement).id)

  }
  

  return (
    <div key={question.id} className='my-5 p-5 border bg-gray-300 rounded-md border-gray-500'>
      {question.pergunta}
      <div className='list-disc'>
        {question.resposta.map(resposta => {
          if (resposta.correta) correta = String(resposta.id)
          return (
            <div key={resposta.id} id={String(resposta.id)} onClick={e => clickAnswer(e)} className={selected == String(resposta.id) ? "bg-blue-500" : ""}>
              {resposta.resposta}
            </div>
          )
        })}
      </div>
      <span className={`whitespace-pre ${resultado == 1 ? 'bg-green-400' : ''} ${resultado == 0 ? 'bg-red-500' : ''}`}>{resultado == 1 ? "Resposta Certa!" : ''} {resultado == 0 ? "Resposta Errada!" : ''} </span>
    </div>
  )

}

