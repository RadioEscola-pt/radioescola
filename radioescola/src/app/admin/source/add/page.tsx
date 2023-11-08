'use client' 
import React, { ChangeEvent, useState } from 'react'
import { SubmitButton } from '../../question/add/page'
import Image from 'next/image'
import { useFormState } from 'react-dom'
import { create } from './addAction'

export default function SourceAdd() {
  const [addForm, setAddForm]  = useFormState(create, {
    message: '',
  })

  const [image, setImage] = useState<string>("")

 
  return (
    <div>
      
      <form action={setAddForm}>
            <label htmlFor="exam">Exame:</label> <input type="text" size={100} name="exam" id="exam" /> <br/>
            <label htmlFor='ficheiro'>Ficheiro:</label> <input type='file' name='ficheiro'/> <br/>
            <select name="categoria">
              <option value="3">3</option>
              <option value="2">2</option>
              <option value="1">1</option>
            </select>

            <SubmitButton />

            <span>{addForm?.message}</span>
            
        </form>
        
    </div>
  )
}
