import React from 'react'
import Link from 'next/link'

export interface ListItemProps {
    name: string
    page?: string
}

function ListItem(props: ListItemProps) {
  return (
    <li>
        <Link
        href={props.page || "#"}
        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-white"
        >{props.name}</Link>
    </li>
  )
}

export default ListItem
