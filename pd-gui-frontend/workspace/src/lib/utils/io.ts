export abstract class IO {
  on_message:Function = () => {}
  on_open:Function = () => {}
  abstract send(message:string) : void
}

export class NullIO extends IO {
  send(message:string) {}
}

export class WebSocketIO extends IO {
  socket: WebSocket

  constructor(address:string) {
    super()
    this.socket = new WebSocket(address)
    this.socket.onopen = () => {
      this.on_open()
    }
    this.socket.onmessage = (event:MessageEvent) => {
      this.on_message(event)
    }
  }

  send(message:string) {
    // console.log('WebSocketIO::send', message)
    this.socket.send(message)
  }
}
