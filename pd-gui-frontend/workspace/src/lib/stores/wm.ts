import { writable, get } from "svelte/store"

import * as G from '../pd/geometry'
import PatchView from '$lib/components/shell/PatchView.svelte'
import type { PdCanvas } from '../pd/pd_canvas'

function DefaultBox() { 
  return new G.Rect(new G.Point(24, 24), new G.Size(480, 360)) 
}

export class ViewKlass {
  constructor(public component: any, public props: any) {}
}

export class View {
  constructor(public window: Fenster, public klass: ViewKlass) {}
}

export class Fenster {
  box = writable<G.Rect>(DefaultBox())
  title = writable<string>("Title")
  z_index = writable<number>(9999)
  hidden = writable<boolean>(false)
  is_active = writable<boolean>(false)
  dialogs:Fenster[] = []
  parent: Fenster|null = null
  view: View

  constructor(public id: number, public klass: ViewKlass, box: G.Rect) {
    this.box.set(box)
    this.view = new View(this, klass)
  }

  move_to(x: number, y: number) {
    this.box.update(box => {
      box.origin.x = x
      box.origin.y = y
      return box
    })
  }

  resize_by(x: number, y: number) {
    this.box.update(box => {
      box.size.width += x
      box.size.height += y
      return box
    })
  }

  hide() {
    this.hidden.update(_ => true)
  }

  unhide() {
    this.hidden.update(_ => false)
  }

  maximize(width: number, height: number) {
    this.box.update(box => {
      box.origin.x = 4
      box.origin.y = 36
      box.size.width = width - 8
      box.size.height = height - 48
      return box
    })
  }
}

export class WindowManager {
  windows = writable<Fenster[]>([])
  next_id = 1
  n_windows = 0
  active_window: Fenster | null = null

  new_canvas_window(canvas: PdCanvas) {
    const box = DefaultBox()
    box.origin.x += this.next_id * 24
    box.origin.y += this.next_id * 24

    const w = new Fenster(this.next_id++, new ViewKlass(PatchView, {canvas}), box)
    this.windows.update(ws => {
      ws.push(w)
      return ws
    })
    this.n_windows++
    this.stack_top(w)
  }

  new_dialog_window(component: any) {
    const box = DefaultBox()
    box.origin.x += this.next_id * 24
    box.origin.y += this.next_id * 24

    const w = new Fenster(this.next_id++, new ViewKlass(component, {}), box)
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

  close_active_window() {
    if (this.active_window) {
      this.close_window(this.active_window)
    }
  }

  stack_top(window: Fenster) {
    // console.log('stack_top')
    let z_index = 9999
    get(this.windows).forEach(w => {
      const is_new_top = window.id == w.id
      w.z_index.update(_ => z_index + (is_new_top ? 9999 : 0))
      w.is_active.update(_ => is_new_top)
    })
    this.active_window = window
  }
}

// export const wm = writable<WindowManager>(new WindowManager())
