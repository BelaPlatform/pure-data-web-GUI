import { writable, get } from 'svelte/store'

import { parse } from './parser'
import { PdCanvas } from './pd_canvas'
import { IO, NullIO } from './io'
import type { PatchFile } from '$lib/stores/patches'
import type { PdWidget } from './pd_widget'

const NullCanvas = new PdCanvas('nil')

export class Pd {
  io: IO = new NullIO()
  canvases = writable<PdCanvas[]>([])
  active_canvas = writable<PdCanvas>(NullCanvas)

  constructor() {}

  use_io(io:IO) {
    this.io = io
    this.io.on_message = (event:MessageEvent) => {
      parse(event.data)
    }
  }

  send(message:string) {
    this.io.send(message)
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
      console.log(canvas)
      for (let widget of get(canvas.widgets)) {
        if (widget.id == id) {
          return widget
        }
      }
    }
    return null
  }
}

export const pd = writable<Pd>(new Pd())