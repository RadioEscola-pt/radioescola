'use client'
import { Prisma } from '@prisma/client'
import React, { createContext, useState } from 'react'
import QuestionCard from './questionCard'
import Score from './score'
import { ScoreContext } from './context'


const perguntaWithRespostas = Prisma.validator<Prisma.PerguntaDefaultArgs>()({
    include: { resposta: true },
})

type PerguntasWithRespostas = Prisma.PerguntaGetPayload<typeof perguntaWithRespostas>


export default function AllQuestions({ question }: { question: PerguntasWithRespostas[]}) {
    let [checkAnswers, setCheckAnswers] = useState<Boolean>(false)

    const [context, setContext] = useState<number>(0)

    return (
        <ScoreContext.Provider value = {{context, setContext}} >
        <div>
            <Score/>
            <button onClick={() => (setCheckAnswers(true))}>test  </button>
            {question.map((question) => (
                <QuestionCard question={question} check={checkAnswers} />
            ))}
        </div>
        </ScoreContext.Provider>
    )
}
