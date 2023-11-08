'use client'
import { Fonte } from '@prisma/client'
import React, { MouseEvent, useContext } from 'react'
import { AdminContext, useAdminContext } from '../../context'



export default function SourcesList({ sources }: { sources: Fonte[]}) {
    const {adminContext, setAdminContext} = useAdminContext()

    function setSource(event: MouseEvent<HTMLButtonElement>){
        setAdminContext(
            {
                sourceName: event.currentTarget.innerText,
                sourceID: Number(event.currentTarget.id)
            })
    }

  return (
    <div>
        
        {sources.map((source) => (
        <button onClick={setSource} id={String(source.id)} key={source.id} className='p-2 m-5 rounded-md border-red-500 border-2 hover:bg-green-600'>{source.fonte}</button>
        ))}

    </div>
  )
}
