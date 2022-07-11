import '../styles/globals.css'
require('../msw')

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
