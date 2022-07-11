import { useState } from 'react'

export default function Home({ book }) {

  return (
    <div>
      <h1>{book.title}</h1>
      <p>{book.description}</p>
    </div>
  )
}

export async function getServerSideProps() {
  // Server-side requests are mocked by `mocks/server.js`.
  const res = await fetch('https://my.backend/book')
  const book = await res.json()

  return {
    props: {
      book,
    },
  }
}