import React from 'react'

export default async function Page({ params }: { params: { nome: string } }) {

    
  return (
    <div>{params.nome}</div>
  )
}
