import { writable } from "svelte/store"

import { WindowManager } from './wm'
import type { PdCanvas } from '../pd/pd_canvas'
import { enumerate_patches, type PatchFile } from '../stores/patches'
import PdDialog from '$lib/components/pd/dialogs/PdDialog.svelte'
import { Direction, PdMessages } from '$lib/pd/pd_messages'
import { WebSocketIO } from '$lib/utils/io'
import { Interpreter } from '$lib/pd/parser/interpreter'
import { Pd } from "$lib/pd/pd"
import { make_menu, type MenuItem } from "./menu"

export enum Theme {
  Vanilla,
  Max,
  Purr
}

export class App {
  show_debug = writable<boolean>(false)
  theme = writable<Theme>(Theme.Vanilla)
  menu = writable<MenuItem[]>([])
  wm: WindowManager
  pd: Pd
  io: WebSocketIO

  constructor() {
    console.log('App!')
    this.wm = new WindowManager(this)
    let addr = 'ws://' + window.location.hostname +':8081';
    this.io = new WebSocketIO(addr)
    this.pd = new Pd(this)
    this.io.on_message = (event:MessageEvent) => {
      const interpreter = new Interpreter(this.pd)
      interpreter.interpret(event.data)
    }
    this.io.on_open = () => this.pd.send_init_sequence()
  }

  async on_startup() {
    console.log('on_startup')
    await enumerate_patches()
    const m = await make_menu()
    this.menu.update(_ => m)
    this.wm.new_dialog_frame(PdDialog)
    PdMessages.push('Hello, World!', Direction.Internal)
  }

  on_new_patch() {
    this.pd.on_create_new_canvas()
  }

  on_open_patch(patch: PatchFile) {
    this.pd.on_open_patch(patch)
  }

  on_toggle_debug() {
    this.show_debug.update(value => !value)
  }

  did_create_canvas(canvas: PdCanvas) {
    console.log('did_create_canvas')
    this.wm.new_canvas_frame(canvas)
  }

  did_destroy_canvas() {
    console.log('did_destroy_canvas')
  }

  log(message: string) {
    PdMessages.push(message, Direction.Internal)
  }
}
