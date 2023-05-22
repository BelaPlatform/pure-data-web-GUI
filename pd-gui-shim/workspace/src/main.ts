import * as cp from 'child_process'
import * as net from 'net'
import { createServer } from 'http'
import { parse } from 'url'
import WebSocket, { WebSocketServer } from 'ws'

import * as config from './config.js'

type LogLevel = 'TRACE' | 'INFO'
const LOG_LEVEL: LogLevel = process.env.LOG_LEVEL == 'TRACE' ? 'TRACE' : 'INFO'

enum PushTxRpcId {
  Close,          // there's already a frontend connected
  Continue,       // you are the only frontend, continue and connect to the Pd message stream
  PdUnavailable,  // Pd did disconnect
  PdAvailable     // Pd did connect
}

enum PushRxRpcId {
  PdAvailable // is Pd running?
}

let pd_client: net.Socket|null = null
let pd_wss_client: WebSocket|null = null
let push_wss_client: WebSocket|null = null
let buffer_from_pd: string = ""
let buffer_to_pd: string = ""

function is_unterminated(str: string) {
  return !(str.endsWith(';') || str.endsWith('\n'))
}

const pd_server = net.createServer((client) => {
  console.log('pd connected')

  pd_client = client

  const init_message = "pd init / 0  8 5 10 10 6 13 12 7 15 16 10 19 24 14 29 37 22 44 17 10 20 20 12 24 24 14 29 32 19 38 47 28 56 73 44 86;"
  pd_client.write(init_message)

  if (push_wss_client) {
    push_wss_client.send(JSON.stringify({rpcid: PushTxRpcId.PdAvailable}))
  }

  client.on('end', () => {
    console.log('pd disconnected')
    if (push_wss_client) {
      push_wss_client.send(JSON.stringify({rpcid: PushTxRpcId.PdUnavailable}))
    }
  })

  client.on('error', (data) => {
    console.log(`ERROR ${data} `)
    if (push_wss_client) {
      push_wss_client.send(JSON.stringify({rpcid: PushTxRpcId.PdUnavailable}))
    }
  })

  client.on('data', (data) => {
    // console.log(`#--${data}--#`)
    const str = `${data}`
    buffer_from_pd += str

    if (is_unterminated(str) && !str.endsWith('pdtk_ping')) {
      if (LOG_LEVEL == 'TRACE') {
        console.log('buffer: unterminated')
      }
    } else {
      if (pd_wss_client) {
        if (LOG_LEVEL == 'TRACE') {
          console.log(`#--${buffer_from_pd}--#`)
        }
        pd_wss_client.send(buffer_from_pd)
        buffer_from_pd = ""
      } else {
        if (LOG_LEVEL == 'TRACE') {
          console.log('buffer: no client connected')
        }
      }
    }
  })
})

pd_server.on('error', (err) => {
  throw err
})

pd_server.listen(config.GUI_PORT, () => {
  console.log(`server bound on ${config.GUI_PORT}`)
})

console.log(process.argv)
let startPd = !("nopd" === process.argv[2]);
if(startPd) {
  const pd = cp.spawn("/pure-data/src/pd", ["-guiport", `${config.GUI_PORT}`])
  pd.stdout.on('data', (data) => {
    console.log(`pd: ${data}`)
  })

  pd.stderr.on('data', (data) => {
    console.error(`pd-err: ${data}`)
  })

  pd.on('close', (code) => {
    console.log(`child process exited with code ${code}`)
  })
}

const http_server = createServer()
const pd_wss = new WebSocketServer({ noServer: true })
const push_wss = new WebSocketServer({ noServer: true })

pd_wss.on('connection', ws => {
  console.log('pd_wss_client connection')

  if (pd_wss_client) {
    console.log('already have a pd_wss_client')
    ws.close()
    return
  }

  pd_wss_client = ws
  pd_wss_client.send(buffer_from_pd)

  ws.on('message', data => {
    buffer_to_pd += `${data}`
    if (pd_client) {
      if (LOG_LEVEL == 'TRACE') {
        console.log(`--#${data}#--`)
      }
      pd_client.write(buffer_to_pd)
      buffer_to_pd = ""
    } else {
      console.log('no pd')
    }
  })

  ws.on("close", () => {
    console.log('pd_wss_client is gone')
    pd_wss_client = null
  })
})

push_wss.on('connection', ws => {
  console.log('push_wss connection')

  if (push_wss_client) {
    console.log('already have a push_wss')
    ws.send(JSON.stringify({rpcid: PushTxRpcId.Close}))
    ws.close()
    return
  }

  ws.send(JSON.stringify({rpcid: PushTxRpcId.Continue}))

  push_wss_client = ws

  ws.on("close", () => {
    console.log('push_wss_client is gone')
    push_wss_client = null
  })
})

http_server.on('upgrade', (request, socket, head) => {
  const { pathname } = parse(request.url || '/')
  if (pathname === '/pd') {
    pd_wss.handleUpgrade(request, socket, head, (ws) => {
      pd_wss.emit('connection', ws, request)
    })
  }
  else if (pathname === '/push') {
     push_wss.handleUpgrade(request, socket, head, (ws) => {
      push_wss.emit('connection', ws, request)
    })
  } else {
    socket.destroy()
  }
})


http_server.listen(config.HTTP_PORT)