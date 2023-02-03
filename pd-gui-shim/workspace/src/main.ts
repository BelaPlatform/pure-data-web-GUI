import * as cp from 'child_process'
import * as net from 'net'
import WebSocket, { WebSocketServer } from 'ws'

import * as config from './config.js'

let pd_client:net.Socket
let ws_client:WebSocket

const server = net.createServer((client) => {
  // 'connection' listener.
  console.log('client connected')
  pd_client = client
  client.on('end', () => {
    console.log('client disconnected')
  })
  client.on('data', (data) => {
    console.log(`#-- ${data} --#`)
    if (ws_client) {
      ws_client.send(`${data}`)
    }
  })
  const watchdog = setInterval(() => {
    pd_client.write("pd watchdog;")
  }, 2000)
})

server.on('error', (err) => {
  throw err
})

server.listen(config.GUI_PORT, () => {
  console.log('server bound')
})


// const pd = cp.spawn("/usr/bin/pd", ["-guiport", `${config.GUI_PORT}`])
// pd.stdout.on('data', (data) => {
//   console.log(`stdout: ${data}`)
// })

// pd.stderr.on('data', (data) => {
//   console.error(`stderr: ${data}`)
// })

// pd.on('close', (code) => {
//   console.log(`child process exited with code ${code}`)
// })


const wss = new WebSocketServer({
  port: config.WS_PORT,
})

wss.on('connection', function connection(ws) {
  console.log('connection')
  ws_client = ws
  ws.on('message', function message(data) {
    // console.log('received: %s', data);
    // ws.send(`OK : ${data}`);
    const stringified_data = `${data}`
    pd_client.write(stringified_data)
  })
})
