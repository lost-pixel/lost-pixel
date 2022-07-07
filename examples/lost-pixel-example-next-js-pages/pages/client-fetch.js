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
      <img style={{width:'640px', height:'360px', borderRadius:'10px'}} src="https://www.fillmurray.com/640/360" />
    </div>
  )
}

export default Profile

