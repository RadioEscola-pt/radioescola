'use client'
import React, { useContext } from 'react'
import { ScoreContext } from './context'


export default function Score() {
    const {context, setContext} = useContext(ScoreContext)

  return (
    <div>{String(context)}</div>
  )
}
