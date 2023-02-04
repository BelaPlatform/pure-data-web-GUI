import { writable, get } from "svelte/store"

import { WindowManager } from './wm'
import { pd } from './pd'
import type { PdCanvas } from '../pd/pd_canvas'

export enum Theme {
  Vanilla,
  Max,
  Purr
}

export class App  {
  show_debug = writable<boolean>(false)
  theme = writable<Theme>(Theme.Vanilla)
  wm: WindowManager

  constructor() {
    console.log('App!')
    this.wm = new WindowManager()
    get(pd).callbacks = this
  }

  on_new_patch() {
    get(pd).on_create_new_canvas()
  }

  did_create_canvas(canvas: PdCanvas) {
    console.log('did_create_canvas')
    this.wm.new_canvas_window(canvas)
  }

  did_destroy_canvas() {
    console.log('did_destroy_canvas')
  }  
}

export const app = writable<App>(new App())
// export const app = new App()
