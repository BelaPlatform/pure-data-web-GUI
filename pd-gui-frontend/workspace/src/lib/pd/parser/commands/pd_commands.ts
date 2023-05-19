import { Command } from './command'
import type { Pd } from '../../pd'

export class Ping extends Command {
  override eval(pd: Pd) {
    pd.send_ping()
  }
}

export class Watchdog extends Command {
  override eval(pd: Pd) {
    console.log('Watchdog')
    pd.enable_watchdog()
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
    console.log('Dsp::eval')
    pd.handle_dsp(this.dsp_is_on)
  }
}


export class DeleteCanvas extends Command {
  constructor(public canvas_id: string) {
    super()
  }

  override eval(pd: Pd) {
    const canvas = pd.canvas_with_id(this.canvas_id)
    if (!canvas) {
      return
    }
    pd.handle_destroy(canvas)
  }
}