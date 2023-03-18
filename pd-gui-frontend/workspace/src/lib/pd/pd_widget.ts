import { writable, get, type Writable } from 'svelte/store'

import type { PdCanvas } from './pd_canvas'
import * as G from '../utils/geometry'
import { Klass, KlassLibrary } from '$lib/components/pd/klasses'

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
    const parent_box = get(this.widget.box)
    const available_width = parent_box.size.width - IOLet.Size.width
    const n_iolets = this.widget.iolets_with_scope(this.scope).length
    const distribution = this.index == 0 ? 0 : this.index / (n_iolets - 1)
    const x =  distribution * available_width
    const y = this.scope == IOLetScope.Input ? 0 : parent_box.size.height - IOLet.Size.height - 1
    return new G.Rect(new G.Point(x, y), IOLet.Size);
  }
}

export type WidgetState = 'normal' | 'edit' | 'broken'
export type WidgetFont = 'dejavu' | 'helvetica' | 'times'

type TextSelection = {
  start: number
  end: number
}

export class PdWidget {
  inlets: IOLet[] = []
  outlets: IOLet[] = []
  text = writable<string>('')
  text_selection = writable<TextSelection>({start: 0, end: 0})
  box: Writable<G.Rect>
  is_activated = writable<boolean>(false)
  is_selected = writable<boolean>(false)
  state = writable<WidgetState>('normal')
  bcolor = writable<string>("#fcfcfc")
  fcolor = writable<string>("#333333")
  lcolor = writable<string>("#000000")
  label = writable<string>('')
  labelpos = writable<G.Point>(G.NullPoint())
  fontsize = writable<number>(12)
  font = writable<string>('DejaVu Sans Mono')
  klass: Klass

  constructor(public id: string, public canvas: PdCanvas, public klassname: string, x: number = 0, y: number = 0) { 
    this.box = writable<G.Rect>(new G.Rect(new G.Point(x, y), new G.Size(0, 0)))
    this.klass = KlassLibrary.klass_for_klassname(this.klassname)
  }

  add_iolet(scope: IOLetScope, type: IOLetType) {
    const index = this.iolets_with_scope(scope).length
    const iolet = new IOLet(index, this, scope, type)
    this.iolets_with_scope(scope).push(iolet)
  }

  iolets_with_scope(scope: IOLetScope) {
    return scope == IOLetScope.Input ? this.inlets : this.outlets
  }

  set_text(txt: string) {
    this.text.update(_ => txt)
  }

  set_is_activated(value: boolean) {
    this.is_activated.update(_ => value)
  }

  set_is_selected(value: boolean) {
    this.is_selected.update(_ => value)
  }

  set_state(state: WidgetState) {
    this.state.update(_ => state)
  }

  set_origin(x: number, y: number) {
    this.box.update(b => {
      b.origin.x = x
      b.origin.y = y
      return b
    })
  }

  displace_origin(x: number, y: number) {
    this.box.update(b => {
      b.origin.x += x
      b.origin.y += y
      return b
    })
  }

  set_size(width: number, height: number) {
    this.box.update(b => {
      if (width < 0) {
        b.origin.x = b.bottom_right().x + width
        b.size.width = Math.abs(width)
      } else {
        b.size.width = width
      }
      if (height < 0) {
        b.origin.y = b.bottom_right().y + height
        b.size.height = Math.abs(height)
      } else {
        b.size.height = height
      }
      return b
    })
  }

  set_bcolor(color: string) {
    this.bcolor.update(_ => color)
  }

  set_fcolor(color: string) {
    this.fcolor.update(_ => color)
  }

  set_lcolor(color: string) {
    this.lcolor.update(_ => color)
  }

  set_label(text: string) {
    this.label.update(_ => text)
  }

  set_labelpos(origin: G.Point) {
    this.labelpos.update(_ => origin)
  }

  set_fontsize(size: number) {
    this.fontsize.update(_ => size)
  }

  set_font(font: string) {
    this.font.update(_ => font)
  }

  handle_text_selection(start: number, end: number) {
    this.text_selection.update(_ => {
      return {start, end}
    })
  }
}