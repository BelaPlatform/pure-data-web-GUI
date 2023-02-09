import { writable, get } from "svelte/store"

import type { App } from './app'
import * as G from '../utils/geometry'
import PatchView from '$lib/components/shell/PatchView.svelte'
import type { PdCanvas } from '../pd/pd_canvas'

function DefaultBox() { 
  return new G.Rect(new G.Point(24, 24), new G.Size(480, 360)) 
}

export class ViewKlass {
  constructor(public component: any, public props: any) {}
}

export class View {
  constructor(public frame: Frame, public klass: ViewKlass) {}
}

export class Frame {
  box = writable<G.Rect>(DefaultBox())
  restore_box = DefaultBox()
  title = writable<string>("Title")
  z_index = writable<number>(9999)
  hidden = writable<boolean>(false)
  is_active = writable<boolean>(false)
  is_resizable = writable<boolean>(true)
  is_maximized = writable<boolean>(false)
  dialogs: Frame[] = []
  parent: Frame|null = null
  view: View
  close_effect: Function|null = null

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
      this.restore_box = box.clone()
      box.origin.x = 4
      box.origin.y = 36
      box.size.width = width - 8
      box.size.height = height - 48
      return box
    })
    this.is_maximized.update(_ => true)
    this.is_resizable.update(_ => false)
  }

  unmaximize() {
    this.box.update(_ => this.restore_box)
    this.is_maximized.update(_ => false)
    this.is_resizable.update(_ => true)
  }

  set_title(title: string) {
    this.title.update(_ => title)
  }

  set_size(size: G.Size) {
    this.box.update(box => {
      box.size = size
      return box
    })
  }

  set_is_resizable(is_resizable: boolean) {
    this.is_resizable.update(_ => is_resizable)
  }
}

export class WindowManager {
  frames = writable<Frame[]>([])
  next_id = 1
  n_frames = 0
  active_frame: Frame | null = null

  constructor(public app: App) {
    console.log('WindowManager!')
  }

  use_app(app: App) {
    console.log('WindowManager::use_app')
    this.app = app
  }

  new_canvas_frame(canvas: PdCanvas) {
    const box = DefaultBox()
    box.origin.x += this.next_id * 24
    box.origin.y += this.next_id * 24

    const w = new Frame(this.next_id++, new ViewKlass(PatchView, {canvas}), box)
    this.frames.update(ws => {
      ws.push(w)
      return ws
    })
    this.n_frames++
    this.stack_top(w)
  }

  new_dialog_frame(component: any) {
    console.log(this)
    console.log(this.app)
    const box = DefaultBox()
    box.origin.x += this.next_id * 24
    box.origin.y += this.next_id * 24

    const frame = new Frame(this.next_id++, new ViewKlass(component, {}), box)
    this.frames.update(fs => {
      fs.push(frame)
      return fs
    })
    this.n_frames++
    this.stack_top(frame)
  }

  close_frame(frame: Frame) {
    // does it have a side effect?
    if (frame.close_effect) {
      frame.close_effect()
    }

    this.frames.update(fs => {
      return fs.filter(f => f.id != frame.id)
    })
  }

  close_active_frame() {
    if (this.active_frame) {
      this.close_frame(this.active_frame)
    }
  }

  stack_top(frame: Frame) {
    // console.log('stack_top')
    let z_index = 9999
    get(this.frames).forEach(f => {
      const is_new_top = frame.id == f.id
      f.z_index.update(_ => z_index + (is_new_top ? 9999 : 0))
      f.is_active.update(_ => is_new_top)
    })
    this.active_frame = frame
  }

  on_keydown(event: KeyboardEvent) {
    console.log(event)
    // is it a shortcut?
    if (event.key == '#' && event.ctrlKey) {
      event.preventDefault()
      this.app.on_toggle_debug()
      return
    }

    if (event.key == 'n' && event.altKey) {
      this.app.on_new_patch()
      event.preventDefault()
      return
    }

    if (event.key == 'w' && event.altKey) {
      this.close_active_frame()
      event.preventDefault()
      return
    }

    // do we have an open canvas?
    const canvas = get(this.app.pd.active_canvas)
    if (canvas) {
      if (event.key == 's' && event.ctrlKey) {
        event.preventDefault()
        canvas.on_save()
        return
      }
    }
  }
}
