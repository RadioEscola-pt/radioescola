'use client'
import { createContext, useContext } from "react"

type ScoreContextType = {
    context: number,
    setContext: React.Dispatch<React.SetStateAction<number>>
}


const iScoreContextState = {
    context: 0,
    setContext: () => {}
}

export const ScoreContext = createContext<ScoreContextType>(iScoreContextState)

export const getScoreContext = () => useContext<ScoreContextType>(ScoreContext)