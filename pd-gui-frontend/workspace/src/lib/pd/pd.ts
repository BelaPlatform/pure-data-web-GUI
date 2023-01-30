import { writable, type Writable, get } from 'svelte/store'

import { parse } from './parser'
import { PdCanvas } from './pd_canvas'
import { IO, NullIO } from './io'
import type { PatchFile } from '$lib/stores/patches'
import type { PdWidget } from './pd_widget'
import type { PdConnection } from './pd_connection'


// events originating from pd are prefixed with handle_
// events originating from user interacion with the frontend are prefixed with on_
export class Pd {
  io: IO = new NullIO()
  canvases = writable<PdCanvas[]>([])
  active_canvas: Writable<PdCanvas>
  dsp_is_on = writable<boolean>(false)

  constructor() {
    this.active_canvas = writable<PdCanvas>(new PdCanvas('nil', this))
  }

  use_io(io:IO) {
    this.io = io
    this.io.on_open = () => {
      this.send_init_sequence()
    }
    this.io.on_message = (event:MessageEvent) => {
      parse(event.data)
    }
  }

  send(message: string) {
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

  on_open_patch(patch: PatchFile) {
    const split_idx = patch.file.lastIndexOf('/')
    const path = patch.file.substring(0, split_idx + 1)
    const file = patch.file.substring(split_idx + 1)
    const message = `pd open ${file} ${path};`
    this.send(message)
  }

  on_create_new_canvas() {
    const message = `pd menunew PDUNTITLED /home/hase/Documents/Pd;`
    this.send(message)
  }

  on_close(canvas: PdCanvas) {
    const message = `${canvas.id} menuclose 0;`
    console.log(`on_close ${message}`)
    this.send(message)
  }

  handle_new_canvas_with_id(id: string) {
    this.canvases.update((cs: PdCanvas[]) => {
      cs = cs.concat([new PdCanvas(id, this)])
      return cs
    })
  }

  handle_destroy(canvas: PdCanvas) {
    let map_other_canvas = false
    // is this the active canavs?
    if (get(this.active_canvas).id == canvas.id) {
      map_other_canvas = true
    }
    this.canvases.update((cs: PdCanvas[]) => {
      cs = cs.filter(c => c.id != canvas.id)
      return cs
    })
    if (map_other_canvas) {
      const new_active_canvas = get(this.canvases).at(0)
      if (new_active_canvas) {
        this.on_map_canvas_with_id(new_active_canvas.id)
      }
    }
  }

  on_map_canvas_with_id(canvas_id: string) {
    const message = `${canvas_id} map 1;`
    this.send(message)
    const canvas = this.canvas_with_id(canvas_id)
    if (canvas) {
      this.active_canvas.update(_ => canvas)
    }
  }

  canvas_with_id(id: string) {
    return get(this.canvases).find(canvas => canvas.id == id)
  }

  widget_with_id(id: string): PdWidget | null {
    for(let canvas of get(this.canvases)) {
      for (let widget of get(canvas.widgets)) {
        if (widget.id == id) {
          return widget
        }
      }
    }
    return null
  }

  widget_or_connection_with_id(id: string): PdWidget|PdConnection|null {
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

  private send_dsp(dsp_is_on: boolean) {
    const message = `pd dsp ${dsp_is_on ? 1 : 0};`
    this.send(message)
  }

  on_toggle_dsp() {
    this.dsp_is_on.update(value => {
      this.send_dsp(!value)
      return value
    })
  }

  handle_dsp(value: boolean) {
    this.dsp_is_on.update(_ => {
      return value
    })
  }  
}
