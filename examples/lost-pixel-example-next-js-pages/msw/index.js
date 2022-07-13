import { rest } from 'msw'

async function initMocks() {
  if (typeof window === 'undefined') {
    const { server } = await import('./server')
    server.listen()
  } else {
    const { worker } = await import('./browser')
    window.mswUse = worker.use
    window.mswRest = rest
    worker.start()
  }
}

initMocks()