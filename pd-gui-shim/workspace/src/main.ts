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

const server = net.createServer((client) => {
  console.log('client connected')
  
  pd_client = client
  
  client.on('end', () => {
    console.log('client disconnected')
  })

  client.on('data', (data) => {
    console.log(`#--${data}--#`)
    const str = `${data}`
    buffer += str
    // console.log(`#-- ${str.length} ${str[str.length-2]} ${str[str.length-1]} --#`)

    /* if (str.includes("set ::sys_searchpath")) {
      // ignore
      console.log('!ignore!')
      return
    } */

    // if ((str[str.length-2] != ';' || str[str.length-1] != '\n') && !(str.endsWith('pdtk_ping'))) {
    const unterm = is_unterminated(str)
/*     console.log(unterm)
    console.log(str.endsWith('pdtk_ping'))
    console.log(str.endsWith('pdtk_ping\n'))
    console.log(str.endsWith('\n')) */
    if (unterm && !str.endsWith('pdtk_ping')) {
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

server.on('error', (err) => {
  throw err
})

server.listen(config.GUI_PORT, () => {
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
  if (buffer.length) {
    console.log('sending buffer')
    console.log(buffer)
    ws_client.send(buffer)
    buffer = ""
  }

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
    console.log('ws_client is gone')
    ws_client = null
  })
})
