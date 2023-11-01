'use client'
import { createContext, useContext, useState } from "react"
import React from 'react'

type ContextType = {
    score: number,
    setScore: React.Dispatch<React.SetStateAction<number>>

}


const iContextState = {
    score: 0,
    setScore: () => {}
}

export const GlobalContext = createContext<ContextType>(iContextState)

export const useGlobalContext = () => useContext(GlobalContext)


export default function ContextProvider({children}: any) {
    const [score, setScore] = useState(0)
  return (
    <GlobalContext.Provider value={{score, setScore}}>
        {children}
    </GlobalContext.Provider>
  )
}
