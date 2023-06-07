import { writable, get } from "svelte/store"

import { WindowManager } from './wm'
import type { PdCanvas } from '../pd/pd_canvas'
import { enumerate_patches, type PatchFile } from '../stores/patches'
import PdDialog from '$lib/components/pd/dialogs/PdDialog.svelte'
import { Direction, PdMessages } from '$lib/pd/pd_messages'
import { WebSocketIO } from '$lib/utils/io'
import { Interpreter } from '$lib/pd/parser/interpreter'
import { Pd } from "$lib/pd/pd"
import { make_menu, type MenuItem } from "./menu"
import { type RpcMessage, PushRxRpcId, PushTxRpcId } from './rpc'

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

type Error = 'pd_unavailable' | 'client_connected' | 'service_unavailable'

export class App {
  show_debug = writable<boolean>(false)
  theme = writable<Theme>(Theme.Vanilla)
  menu = writable<MenuItem[]>([])
  wm: WindowManager
  pd = writable<Pd|null>(null)
  pd_io: WebSocketIO|null = null
  push_io: WebSocketIO
  user_agent: UserAgent
  init_sequence_sent = false
  error = writable<Error|null>(null)

  constructor() {
    this.wm = new WindowManager(this)

    this.push_io = new WebSocketIO(`ws://${window.location.hostname}:8081/push`)
    this.push_io.on_message = async (event:MessageEvent) => {
      console.log(event.data)
      const message: RpcMessage = JSON.parse(event.data)
      switch (message.rpcid) {
        case PushTxRpcId.Close:
          console.log('Close')
          // display an error message and shut down
          this.error.update(() => 'client_connected')
          break
        case PushTxRpcId.Continue:
          console.log('Continue')
          // ask if Pd is available
          this.push_io.send(JSON.stringify({rpcid: PushRxRpcId.PdAvailable}))
          break
        case PushTxRpcId.PdAvailable:
          console.log('PdAvailable')
          // this.wm = new WindowManager(this)
          await this.initialize_pd()
          break
        case PushTxRpcId.PdUnavailable:
          console.log('PdUnavailable')
          // reset all pd-related state and display an error message
          this.wm.destroy_canvas_frames()
          await this.teardown_pd()
          break
      }
    }

    this.push_io.socket.onerror = () => {
      console.log('push_io.onerror')
      // this.error.update(() => 'service_unavailable')
    }

    this.push_io.socket.onclose = () => {
      console.log('push_io.onclose')
      // this.error.update(() => 'service_unavailable')
    }

    this.user_agent = {is_mobile: false, platform: 'linux', browser: 'chrome'}
  }

  private async initialize_pd() {
    this.pd_io = new WebSocketIO(`ws://${window.location.hostname}:8081/pd`)
    this.pd_io.on_message = (event:MessageEvent) => {
      // console.log('io.on_message')
      const pd = get(this.pd)!
      const interpreter = new Interpreter(pd)
      interpreter.interpret(event.data)

      if (!this.init_sequence_sent) {
        this.init_sequence_sent = true
        pd.send_refresh_gui()
      }
    }

    this.pd_io.on_open = () => {
      // console.log('io.on_open')
      // this.pd.send_init_sequence()
      const pd = new Pd(this)
      this.pd.update(() => pd)
    }
  }

  private async teardown_pd() {
    this.pd.update((pd) => {
      if (pd) {
        pd.teardown()
      }
      return null
    })

    if (this.pd_io) {
      this.pd_io.socket.close()
      this.pd_io = null
    }
    this.error.update(() => 'pd_unavailable')
  }

  async on_startup() {
    // console.log('on_startup')
    await this.on_update_menu()
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
    const pd = get(this.pd)
    pd!.on_create_new_canvas()
  }

  on_open_patch(patch: PatchFile) {
    const pd = get(this.pd)
    pd!.on_open_patch(patch)
  }

  on_toggle_debug() {
    this.show_debug.update(value => !value)
  }

  did_create_canvas(canvas: PdCanvas) {
    // console.log(`did_create_canvas ${canvas.id}`)
    this.wm.new_canvas_frame(canvas)
  }

  handle_did_destroy_canvas(canvas: PdCanvas) {
    // console.log('handle_did_destroy_canvas')
    const frame = this.wm.frame_for_canvas(canvas)
    if (frame) {
      // console.log('have a frame_for_canvas')
      frame.close_effect = null
      this.wm.close_frame(frame)
    } else {
      // console.log('have no frame')
    }
  }

  log(message: string) {
    PdMessages.push(message, Direction.Internal)
  }

  handle_update_window_menu() {
    this.on_update_menu()
  }

  async on_update_menu() {
    await enumerate_patches()
    const m = await make_menu()
    this.menu.update(_ => m)
  }

  on_beforeunload(event: BeforeUnloadEvent) {
    if (get(this.pd)?.has_dirty_patches()) {
      event.preventDefault()
      event.returnValue = 'Save?'
      return 'Save?'
    }

    return null
  }
}
