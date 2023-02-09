import { writable } from 'svelte/store'

import * as G from '../utils/geometry'
import type { PdCanvas } from './pd_canvas'

export enum PdConnectionType {
  Message, Signal
}

export class PdConnection {
  from = writable<G.Point>(G.NullPoint())
  to = writable<G.Point>(G.NullPoint())
  is_selected = writable<boolean>(false)
  type = writable<PdConnectionType>(PdConnectionType.Message)

  constructor(public id: string, public canvas: PdCanvas) { }

  set_coordinates(from_x:number, from_y:number, to_x:number, to_y:number) {
    this.from.update(_ => {
      return new G.Point(from_x, from_y)
    })
    this.to.update(_ => {
      return new G.Point(to_x, to_y)
    })
  }

  set_is_selected(value:boolean) {
    this.is_selected.update(_ => { return value })
  }

  set_type(type: PdConnectionType) {
    this.type.update(_ => { return type })
  }
}