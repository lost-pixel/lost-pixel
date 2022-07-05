import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

export default function Home( { data } ) {
  console.log(data)

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
      <div style={{fontSize:'36px',fontWeight:'bold', color:'tomato'}}>
        {data.name}
      </div>
      <div style={{fontWeight:'lighter'}}>
        {data.email}
      </div>
      </main>

    </div>
  )
}


// This gets called on every request
export async function getServerSideProps() {
  // Fetch data from external API
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/1`)
  const data = await res.json()

  // Pass data to the page via props
  return { props: { data } }
}