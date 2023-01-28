import { writable } from 'svelte/store'
import * as G from './geometry'

export class PdConnection {
  from = writable<G.Point>(G.NullPoint())
  to = writable<G.Point>(G.NullPoint())

  constructor(public id:string) { }

  set_coordinates(from_x:number, from_y:number, to_x:number, to_y:number) {
    this.from.update(_ => {
      return new G.Point(from_x, from_y)
    })
    this.to.update(_ => {
      return new G.Point(to_x, to_y)
    })
  }
}