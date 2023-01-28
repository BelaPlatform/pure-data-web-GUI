import Object from './Object.svelte'
import Bang from './Bang.svelte'
import Toggle from './Toggle.svelte'
import Message from './Message.svelte'
import Comment from './Comment.svelte'

export class Klass {
  constructor(public name:string, public impl:any) {}
}

export class KlassLibrary_ {
  klasses:Klass[] = []

  constructor() {
    this.klasses = [
      new Klass("object", Object),
      new Klass("bang", Bang),
      new Klass("toggle", Toggle),
      new Klass("message", Message),
      new Klass("comment", Comment),
    ]
  }

  klass_for_klassname(klassname:string) : Klass {
    return this.klasses.find((k) => k.name == klassname) || this.klasses[0]
  }
}

export const KlassLibrary = new KlassLibrary_()

