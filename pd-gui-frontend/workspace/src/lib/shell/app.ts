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

export type Platform = 'linux' | 'mac'
export type Browser = 'chrome' | 'safari' | 'firefox'

export type UserAgent = {
  is_mobile: boolean
  platform: Platform
  browser: Browser
}

export class App {
  show_debug = writable<boolean>(false)
  theme = writable<Theme>(Theme.Vanilla)
  menu = writable<MenuItem[]>([])
  wm: WindowManager
  pd: Pd
  io: WebSocketIO
  user_agent: UserAgent
  init_sequence_sent = false

  constructor() {
    this.wm = new WindowManager(this)
    let addr = 'ws://' + window.location.hostname +':8081';
    this.io = new WebSocketIO(addr)
    this.pd = new Pd(this)
    this.io.on_message = (event:MessageEvent) => {
      // console.log('io.on_message')
      const interpreter = new Interpreter(this.pd)
      interpreter.interpret(event.data)

      if (!this.init_sequence_sent) {
        this.init_sequence_sent = true
        this.pd.send_init_sequence()
      }
    }
    this.io.on_open = () => {
      // console.log('io.on_open')
      // this.pd.send_init_sequence()
    }
    this.user_agent = {is_mobile: false, platform: 'linux', browser: 'chrome'}
  }

  async on_startup() {
    await enumerate_patches()
    const m = await make_menu()
    this.menu.update(_ => m)
    this.wm.on_show_singleton_dialog('pd')
    PdMessages.push(navigator.userAgent, Direction.Internal)
    if (navigator.userAgent.search('Macintosh') != -1) {
      this.user_agent.platform = 'mac'
    }
    const contains_safari = navigator.userAgent.search('Safari') != -1
    const contains_chrome = navigator.userAgent.search('Chrome') != -1
    if (contains_safari && !contains_chrome) {
      this.user_agent.browser = 'safari'
    }
    this.user_agent.is_mobile = navigator.maxTouchPoints > 0
    PdMessages.push(`browser:${this.user_agent.browser} platform:${this.user_agent.platform} mobile:${this.user_agent.is_mobile}`, Direction.Internal)
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
    this.wm.new_canvas_frame(canvas)
  }

  handle_did_destroy_canvas(canvas: PdCanvas) {
    const frame = this.wm.frame_for_canvas(canvas)
    if (frame) {
      frame.close_effect = null
      this.wm.close_frame(frame)
    }
  }

  log(message: string) {
    PdMessages.push(message, Direction.Internal)
  }
}
