import { writable, type Writable } from 'svelte/store'

import * as G from './geometry'
import { Klass, KlassLibrary } from '$lib/components/klasses'

export enum IOLetScope {
  Input, Output
}

export enum IOLetType {
  Message, Signal
}

export class IOLet {
  static Size = new G.Size(8, 2)

  constructor(public index: number, public widget: PdWidget, public scope: IOLetScope, public type: IOLetType) {}

  get box() : G.Rect {
    const available_width = this.widget.box.size.width - IOLet.Size.width
    const n_iolets = this.widget.iolets_with_scope(this.scope).length
    const distribution = this.index == 0 ? 0 : this.index / (n_iolets - 1)
    const x =  distribution * available_width
    const y = this.scope == IOLetScope.Input ? 0 : this.widget.box.size.height - IOLet.Size.height - 1
    return new G.Rect(new G.Point(x, y), IOLet.Size);
  }
}

export class PdWidget {
  inlets: IOLet[] = []
  outlets: IOLet[] = []
  text = writable<string>('')
  box: G.Rect
  is_activated = writable<boolean>(false)
  klass: Klass

  constructor(public id:string, public klassname: string, x: number = 0, y: number = 0) { 
    this.box = new G.Rect(new G.Point(x, y), new G.Size(0, 0))
    this.klass = KlassLibrary.klass_for_klassname(this.klassname)
  }

  add_iolet(scope: IOLetScope, type: IOLetType) {
    const index = this.iolets_with_scope(scope).length
    const iolet = new IOLet(index, this, scope, type)
    this.iolets_with_scope(scope).push(iolet)
  }

  iolets_with_scope(scope:IOLetScope) {
    return scope == IOLetScope.Input ? this.inlets : this.outlets
  }

  set_text(txt:string) {
    this.text.update(_ => { return txt })
  }
}