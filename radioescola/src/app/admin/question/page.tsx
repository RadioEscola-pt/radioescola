import Link from 'next/link'
import React from 'react'



export default function Questions() {
  return (
    <div>
        <Link href="/admin/question/list">List question</Link>
        <Link href="/admin/question/add">Add question</Link>

    </div>
  )
}
