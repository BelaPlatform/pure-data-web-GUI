// import * as cp from 'child_process'
import * as net from 'net'
import WebSocket, { WebSocketServer } from 'ws'
import * as cp from 'child_process'

import * as config from './config.js'

let pd_client: net.Socket
let ws_clients: WebSocket[] = []

let buffer: string = ""

const server = net.createServer((client) => {
  console.log('client connected')
  pd_client = client
  client.on('end', () => {
    console.log('client disconnected')
  })
  client.on('data', (data) => {
    console.log(`#--${data}--#`)
    const str =  `${data}`
    // console.log(`#-- ${str.length} ${str[str.length-2]} ${str[str.length-1]} --#`)

    if (str.includes("set ::sys_searchpath")) {
      // ignore
      console.log('!ignore!')
      return
    }

    buffer += str

    if ((str[str.length-2] != ';' || str[str.length-1] != '\n') && !(str.endsWith('pdtk_ping\n'))) {
      console.log('!dont send, just buffer!')
    } else {
      ws_clients.forEach(client => client.send(buffer))
      buffer = ""
    }
  })
  client.on('error', (data) => {
    console.log(`ERROR ${data} `)
  })
  const watchdog = setInterval(() => {
    pd_client.write("pd watchdog;")
  }, 2000)
})

server.on('error', (err) => {
  throw err
})

server.listen(config.GUI_PORT, () => {
  console.log(`server bound on ${config.GUI_PORT}`)
})

const pd = cp.spawn("/pure-data/src/pd", ["-guiport", `${config.GUI_PORT}`])
pd.stdout.on('data', (data) => {
  console.log(`pd: ${data}`)
})

pd.stderr.on('data', (data) => {
  console.error(`pd-err: ${data}`)
})

pd.on('close', (code) => {
  console.log(`pd child process exited with code ${code}`)
})

const frontend = cp.spawn('pnpm', ['start:watch'], {
  cwd: '/workspace-frontend'
})

frontend.stdout.on('data', (data) => {
  console.log(`frontend: ${data}`)
})

frontend.stderr.on('data', (data) => {
  console.log(`frontend-err: ${data}`)
})

frontend.on('close', (code) => {
  console.log(`frontend child process exited with code ${code}`)
})

process.on('close', () => {
  pd.kill(2)
  frontend.kill(2)
})
const wss = new WebSocketServer({
  port: config.WS_PORT,
})

wss.on('connection', ws => {
  console.log('connection')
  ws_clients.push(ws)
  ws.on('message', data => {
    console.log(`${data}`)
    pd_client.write(`${data}`)
  })
})
