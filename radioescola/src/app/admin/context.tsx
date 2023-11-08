'use client'
import Link from "next/link"
import { createContext, useContext, useState } from "react"
import React from 'react'

export type adminContext = {
  sourceID?: number,
  sourceName: String,
}

export type ContextType = {
    adminContext: adminContext,
    setAdminContext: React.Dispatch<React.SetStateAction<adminContext>>,
}


const iContextState = {
    adminContext: {
      sourceID: undefined,
      sourceName: ""
    },
    setAdminContext: () => {},
}

export const AdminContext = createContext<ContextType>(iContextState)

export const useAdminContext = () => useContext(AdminContext)


export default function ContextProvider({children}: any) {
    const [adminContext, setAdminContext] = useState<adminContext>({
      sourceID: undefined,
      sourceName: ""
    })

  return (
    <AdminContext.Provider value={{adminContext, setAdminContext}}>

        {adminContext.sourceID ? "A editar o exame " + adminContext.sourceName: ""} 

        {children}
    </AdminContext.Provider>
  )
}
