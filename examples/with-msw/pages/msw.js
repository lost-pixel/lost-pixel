import { useEffect, useState } from 'react'

export default function Home({ book }) {
  const [reviews, setReviews] = useState(null)

  useEffect(()=>{
   setTimeout(()=>{
    fetch('/reviews')
    .then((res) => console.log(res)|| res.json())
    .then(setReviews)
   },100)
  },[])


  return (
    <div>
      <img src={book.imageUrl} alt={book.title} width="250" />
      <h1>{book.title}</h1>
      <p>{book.description}</p>
      {reviews && (
        <ul>
          {reviews.map((review) => (
            <li key={review.id}>
              <p>{review.text}</p>
              <p>{review.author}</p>
            </li>
          ))}
        </ul>
      )}
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
