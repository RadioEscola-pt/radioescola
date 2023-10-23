'use client'
import React, { useContext } from 'react'
import { GlobalContext } from '../../../context'


export default function Score() {
    const {score, setScore} = useContext(GlobalContext);
  return (
    <div>Score: {String(score)}</div>
  )
}
