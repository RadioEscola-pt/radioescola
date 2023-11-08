'use client'
import React, { ChangeEvent, ChangeEventHandler, ReactHTMLElement, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { create } from './addAction'
import { useAdminContext } from '../../context'
import Image from 'next/image'

export function SubmitButton( ) {
    const {pending} = useFormStatus()

    return (
        <>
        <button type="submit" disabled={pending}>
        Add
      </button>
      {pending ? 'loading' : ''}

      </>
    )
}

export default function AddQuestion() {
    const [addForm, setAddForm]  = useFormState(create, {
        message: '',
      })

    const {adminContext, setAdminContext} = useAdminContext()

    const [image, setImage] = useState<string>("")

    function changeHandler( event : ChangeEvent<HTMLInputElement> ){
        let file = new File([], "")
        if (event.target.files != null) file = event.target.files[0]
        setImage(URL.createObjectURL(file))
        console.log(event.target.files && event.target.files[0])
    }


  return (
    <div>
        {adminContext.sourceName}
        <form action={setAddForm}>
            <label htmlFor="question">Questão:</label> <input type="text" size={100} name="question" id="question" /> <br/>
            <label htmlFor="resposta1">Resposta 1:</label> <input type="text" size={100} name="resposta[]" id="resposta1" /> <input type="radio" name="correta" value="0" /> <br/>
            <label htmlFor="resposta2">Resposta 2:</label> <input type="text" size={100} name="resposta[]" id="resposta2" /> <input type="radio" name="correta" value="1" /> <br/>
            <label htmlFor="resposta3">Resposta 3:</label> <input type="text" size={100} name="resposta[]" id="resposta3" /> <input type="radio" name="correta" value="2" /> <br/>
            <label htmlFor="resposta4">Resposta 4:</label> <input type="text" size={100} name="resposta[]" id="resposta4" /> <input type="radio" name="correta" value="3" /> <br/>
            <label htmlFor="notes">Notas:</label><input type="text" size={150} name="notes" id="notes" /> <br/>
            <label htmlFor='imagem'>Imagem:</label> <input type='file' name='imagem' onChange={changeHandler} />
            {image ? <Image src={image} alt='' width='200' height={50}/> : ""} 
            
            <label htmlFor="fonte">Fonte:</label> <input type="hidden" name="fonte" id="fonte" value={adminContext.sourceID}/> <br/>
            <SubmitButton />

            <span>{addForm?.message}</span>
            
        </form>

    </div>
  )
}
