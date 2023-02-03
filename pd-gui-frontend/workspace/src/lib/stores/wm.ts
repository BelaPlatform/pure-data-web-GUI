import { writable, get } from "svelte/store"

import * as G from '../pd/geometry'

function DefaultBox() { 
  return new G.Rect(new G.Point(24, 24), new G.Size(480, 360)) 
}

export class Fenster {
  box = writable<G.Rect>(DefaultBox())
  title = writable<string>("Title")
  z_index = writable<number>(9999)
  hidden = writable<boolean>(false)

  constructor(public id: number, box: G.Rect) {
    this.box.set(box)
  }

  move_to(x: number, y: number) {
    this.box.update(box => {
      box.origin.x = x
      box.origin.y = y
      return box
    })
  }

  hide() {
    this.hidden.update(_ => true)
  }

  unhide() {
    this.hidden.update(_ => false)
  }  
}

class WindowManager {
  windows = writable<Fenster[]>([])
  next_id = 1
  n_windows = 0

  new_window() {
    const box = DefaultBox()
    box.origin.x += this.next_id * 24
    box.origin.y += this.next_id * 24
    const w = new Fenster(this.next_id++, box)

    this.windows.update(ws => {
      ws.push(w)
      return ws
    })
    this.n_windows++
  }

  close_window(window: Fenster) {
    this.windows.update(ws => {
      return ws.filter(w => w.id != window.id)
    })
  }

  stack_top(window: Fenster) {
    // console.log('stack_top')
    let z_index = 9999
    get(this.windows).forEach(w => {
      w.z_index.update(_ => z_index + (window.id == w.id ? 9999 : 0))
    })
  }
}

export const wm = writable<WindowManager>(new WindowManager())
