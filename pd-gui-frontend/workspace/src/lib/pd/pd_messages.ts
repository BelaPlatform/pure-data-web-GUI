import { writable } from 'svelte/store'

export enum Direction {
  Incoming, Outgoing
}

export class PdMessage {
  repeat_count: number = 0

  constructor(public content: string, public direction: Direction = Direction.Incoming) {}

  get isIncoming() { return this.direction == Direction.Incoming }
}

export class PdMessageList {
  messages = writable<PdMessage[]>([])

  push(content:string, direction:Direction = Direction.Incoming) {
    const message = new PdMessage(content, direction)
    
    this.messages.update((ms:PdMessage[]) => {
      ms = ms.concat([message])
      return ms
    })
  }
}

export const PdMessages = new PdMessageList()
