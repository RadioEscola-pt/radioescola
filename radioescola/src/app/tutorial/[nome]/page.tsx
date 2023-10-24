import React from 'react'
import { promises as fs } from 'fs';


export default async function Page({ params }: { params: { nome: string } }) {

  const file = await fs.readFile(process.cwd()  + '/../capitulos/' + params.nome + "/index.html", 'utf8');
    
  return (
    <div dangerouslySetInnerHTML={{__html: file}}></div>
  )
}
