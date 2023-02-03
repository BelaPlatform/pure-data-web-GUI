import { Command } from './command'
import type { Pd } from '../../pd'

export class Ping extends Command {
  override eval(pd: Pd) {
    pd.send_ping()
  }
}

export class Watchdog extends Command {
  override eval(_: Pd) {
    console.log('Watchdog')
  }
}

export class Startup extends Command {
  override eval(_: Pd) {}
}

export class UndoMenu extends Command {
  override eval(_: Pd) {}
}

export class Set extends Command {
  override eval(_: Pd) {}
}

export class Dsp extends Command {
  constructor(public dsp_is_on: boolean) {
    super()
  }

  override eval(pd: Pd) {
    pd.handle_dsp(this.dsp_is_on)
  }
}