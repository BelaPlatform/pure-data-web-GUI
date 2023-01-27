export abstract class IO {
  on_message:Function = () => {}
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
    this.socket.onmessage = (event:MessageEvent) => {
      this.on_message(event)
    }
  }

  send(message:string) {
    this.socket.send(message)
  }
}
