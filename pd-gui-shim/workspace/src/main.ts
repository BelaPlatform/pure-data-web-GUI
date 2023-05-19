import * as cp from 'child_process'
import * as net from 'net'
import WebSocket, { WebSocketServer } from 'ws'

import * as config from './config.js'

let pd_client: net.Socket|null = null
let ws_client: WebSocket|null = null

let buffer: string = ""

function is_unterminated(str: string) {
  return !(str.endsWith(';') || str.endsWith('\n'))
}

const pd_server = net.createServer((client) => {
  console.log('pd connected')

  pd_client = client

  const init_message = "pd init / 0  8 5 10 10 6 13 12 7 15 16 10 19 24 14 29 37 22 44 17 10 20 20 12 24 24 14 29 32 19 38 47 28 56 73 44 86;"
  pd_client.write(init_message)

  client.on('end', () => {
    console.log('pd disconnected')
  })

  client.on('data', (data) => {
    console.log(`#--${data}--#`)
    const str = `${data}`
    buffer += str

    if (is_unterminated(str) && !str.endsWith('pdtk_ping')) {
      console.log('buffer: unterminated')
    } else {
      if (ws_client) {
        console.log(`sending #--${buffer}--#`)
        ws_client.send(buffer)
        buffer = ""
      } else {
        console.log('buffer: no client connected')
      }
    }
  })

  client.on('error', (data) => {
    console.log(`ERROR ${data} `)
  })
  /*
  // watchdog is only handled by Pd if it is running on Linux
  // we disable it here to avoid spurious warnings on other platforms
  const watchdog = setInterval(() => {
    pd_client.write("pd watchdog;")
  }, 2000)
  */
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

const wss = new WebSocketServer({
  port: config.WS_PORT,
})

wss.on('connection', ws => {
  console.log('connection')

  if (ws_client) {
    console.log('already have a client')
    ws.close()
    return
  }

  ws_client = ws
  ws_client.send(buffer)

  ws.on('message', data => {
    console.log(`--#${data}#--`)
    if (pd_client) {
      console.log('sending to pd')
      pd_client.write(`${data}`)
    } else {
      console.log('no pd')
    }
  })

  ws.on("close", (code) => {
    // console.log('ws_client is gone')
    ws_client = null
  })
})
