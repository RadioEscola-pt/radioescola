'use client'
import { Prisma } from '@prisma/client'
import React, { useState } from 'react'
import QuestionCard from '../../../components/questionCard'
import ContextProvider from '@/context'
import Score from './score'


const perguntaWithRespostas = Prisma.validator<Prisma.PerguntaDefaultArgs>()({
    include: { resposta: true },
})

type PerguntasWithRespostas = Prisma.PerguntaGetPayload<typeof perguntaWithRespostas>


export default function AllQuestions({ question }: { question: PerguntasWithRespostas[]}) {
    let [checkAnswers, setCheckAnswers] = useState<Boolean>(false)

    return (
        <div>
            <ContextProvider>
            <Score />
            <button onClick={() => (setCheckAnswers(true))}>Verificar</button>
            {question.map((question) => (
                <QuestionCard question={question} check={checkAnswers} mode="all"/>
            ))}
            </ContextProvider>
        </div>
    )
}
