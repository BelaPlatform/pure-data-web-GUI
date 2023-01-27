import { writable, get } from 'svelte/store'

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
    const messages_ = get(this.messages)
    const last_message = messages_.at(messages_.length - 1)
    if (last_message && last_message.content == content) {
      last_message.repeat_count++
      this.messages.update(ms => ms)
      return
    }

    const message = new PdMessage(content, direction)
    // console.log('PdMessageList::push')
    // console.log(message)
    this.messages.update((ms:PdMessage[]) => {
      ms = ms.concat([message])
      return ms
    })
  }
}

export const PdMessages = new PdMessageList()
