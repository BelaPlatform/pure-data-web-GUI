import type { Pd } from '$lib/pd/pd'

export abstract class Command {
  abstract eval(pd: Pd) : void
}

export class NullCommand extends Command {
  eval(pd: Pd) {}
}


export class UnrecognizedCommand extends Command {
  constructor(public name: string) {
    super()
  }

  eval(_: Pd) {
    console.log(`UnrecognizedCommand: ${this.name}`)
  }
}

export class IgnoredCommand extends Command {
  constructor(public name: string) {
    super()
  }

  eval(_: Pd) {
    console.log(`IgnoredCommand: ${this.name}`)
  }
}