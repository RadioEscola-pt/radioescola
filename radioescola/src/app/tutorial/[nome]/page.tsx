import React, { ReactElement } from 'react'
import { promises as fs } from 'fs';
import SWR from './tutoriais/SWR';
import Alfabeto from './tutoriais/Alfabeto';
import Entidades from './tutoriais/Entidades';


export default function Page({ params }: { params: { nome: string } }) {

  const tutoriais : {[key: string]: React.JSX.Element}  =  {
    "SWR": <SWR/>,
    "alfabeto": <Alfabeto/>,
    "entidades": <Entidades/>
  }
    
  return (
    <div>{tutoriais[params.nome]}</div>
  )
}
