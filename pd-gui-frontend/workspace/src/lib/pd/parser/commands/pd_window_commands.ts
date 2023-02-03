import { Command } from './command'
import type { Pd } from '../../pd'
import { PdMessages } from '../../pd_messages'

export class Post extends Command {
  constructor(public message: string) {
    super()
  }

  override eval(pd: Pd) {
    PdMessages.push(this.message)
  }
}
