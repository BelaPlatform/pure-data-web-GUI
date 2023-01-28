import { writable, get } from 'svelte/store'

import { parse } from './parser'
import { PdCanvas } from './pd_canvas'
import { IO, NullIO } from './io'
import type { PatchFile } from '$lib/stores/patches'
import type { PdWidget } from './pd_widget'
import type { PdConnection } from './pd_connection'

const NullCanvas = new PdCanvas('nil')

export class Pd {
  io: IO = new NullIO()
  canvases = writable<PdCanvas[]>([])
  active_canvas = writable<PdCanvas>(NullCanvas)

  constructor() {}

  use_io(io:IO) {
    this.io = io
    this.io.on_open = () => {
      this.send_init_sequence()
    }
    this.io.on_message = (event:MessageEvent) => {
      parse(event.data)
    }
  }

  send(message:string) {
    this.io.send(message)
  }

  send_init_sequence() {
    const message = "pd init /home/hase/Workspace/AIL/bela2-develop/proto/pd-gui/pure-data 0  8 5 10 10 6 13 12 7 15 16 10 19 24 14 29 37 22 44 17 10 20 20 12 24 24 14 29 32 19 38 47 28 56 73 44 86;"
    this.send(message)
  }

  send_ping() {
    const message = "pd ping;"
    this.send(message)
  }

  send_mouse_down(x: number, y: number, button: number) {
    const canvas_id = get(this.active_canvas).id
    const message = `${canvas_id} mouse ${x * 1.0} ${y * 1.0} 1 0;`
    this.send(message)
  }

  send_mouse_up(x: number, y: number, button: number) {
    const canvas_id = get(this.active_canvas).id
    const message = `${canvas_id} mouseup ${x * 1.0} ${y * 1.0} 1 0;`
    this.send(message)
  }

  send_motion(x: number, y: number) {
    const canvas_id = get(this.active_canvas).id
    const message = `${canvas_id} motion ${x * 1.0} ${y * 1.0} 0;`
    this.send(message)
  }

  open_patch(patch:PatchFile) {
    const split_idx = patch.file.lastIndexOf('/')
    const path = patch.file.substring(0, split_idx + 1)
    const file = patch.file.substring(split_idx + 1)
    const message = `pd open ${file} ${path};`
    this.send(message)
  }

  map_canvas_with_id(canvas_id:string) {
    const message = `${canvas_id} map 1;`
    this.send(message)
    const canvas = this.canvas_with_id(canvas_id)
    if (canvas) {
      this.active_canvas.update(_ => canvas)
    }
  }

  new_canvas_with_id(id:string) {
    this.canvases.update((cs:PdCanvas[]) => {
      cs = cs.concat([new PdCanvas(id)])
      return cs
    })
  }

  canvas_with_id(id:string) {
    return get(this.canvases).find(canvas => canvas.id == id)
  }

  widget_with_id(id:string): PdWidget|null {
    for(let canvas of get(this.canvases)) {
      for (let widget of get(canvas.widgets)) {
        if (widget.id == id) {
          return widget
        }
      }
    }
    return null
  }

  widget_or_connection_with_id(id:string): PdWidget|PdConnection|null {
    for(let canvas of get(this.canvases)) {
      for (let widget of get(canvas.widgets)) {
        if (widget.id == id) {
          return widget
        }
      }
      for (let connection of get(canvas.connections)) {
        if (connection.id == id) {
          return connection
        }
      }
    }
    return null
  }

}

export const pd = writable<Pd>(new Pd())