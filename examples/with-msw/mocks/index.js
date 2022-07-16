import { rest } from 'msw'

async function initMocks() {
  console.log('init mocks')
  if (typeof window === 'undefined') {
    console.log('landed in server part of init mocks')
    const { server } = await import('./server')
    server.listen()
  } else {
    const { worker } = await import('./browser')
    console.log('rewriting window')
    window.mswWorker = worker
    window.mswRest = rest
    worker.start()
  }
}

initMocks()
