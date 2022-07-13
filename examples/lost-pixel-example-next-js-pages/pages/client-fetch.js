import React, { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';

function Profile() {
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('https://jsonplaceholder.typicode.com/photos/1')
      .then((res) => res.json())
      .then((data) => {
        setData(data)
        setLoading(false)
      })
  }, [])

  if (isLoading) return <p>Loading...</p>
  if (!data) return <p>No profile data</p>

  return (
    <div className={styles.main}>
      <div style={{fontSize:'36px',fontWeight:'bold', color:'crimson', marginBottom:'20px'}}>
        {data.title}
      </div>
      <img style={{width:'640px', height:'360px', borderRadius:'10px'}} src="https://dummyimage.com/640x360/5b0fd6/fff.png?text=Lost+Pixel" />
    </div>
  )
}

export default Profile

