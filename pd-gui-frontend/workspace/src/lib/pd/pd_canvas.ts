import { writable, get } from 'svelte/store'

import type { Pd } from './pd'
import type { PdConnection } from './pd_connection'
import type { PdWidget } from './pd_widget'


export class PdCanvas {
  title: string = ""
  widgets = writable<PdWidget[]>([])
  connections = writable<PdConnection[]>([])
  is_mapped: boolean = false
  edit_mode = writable<boolean>(false)
  cursor = writable<string>('runmode_nothing')

  constructor(public id: string, public pd: Pd) {
    this.edit_mode.subscribe(value => {
      this.send_set_edit_mode(value ? 1 : 0)
    })
  }

  add_widget(widget:PdWidget) {
    this.widgets.update(ws => {
      ws.push(widget)
      return ws
    })
  }

  add_connection(connection:PdConnection) {
    this.connections.update(cs => {
      cs.push(connection)
      return cs
    })
  }

  set_cursor(cursor_name:string) {
    // console.log(`set_cursor ${cursor_name}`)
    this.cursor.update(_ => {
      return cursor_name
    })
  }

  send_set_edit_mode(value: number) {
    const message = `${this.id} editmode ${value};`
    this.pd.send(message)
  }

  send_mouse_down(x: number, y: number, button: number) {
    const message = `${this.id} mouse ${x * 1.0} ${y * 1.0} 1 0;`
    this.pd.send(message)
  }

  send_mouse_up(x: number, y: number, button: number) {
    const message = `${this.id} mouseup ${x * 1.0} ${y * 1.0} 1 0;`
    this.pd.send(message)
  }

  send_motion(x: number, y: number) {
    const message = `${this.id} motion ${x * 1.0} ${y * 1.0} 0;`
    this.pd.send(message)
  }

  send_key(key: string, keydown: boolean) {
    const message = `${this.id} key ${key} ${keydown ? 1 : 0} 0;`
    this.pd.send(message)
  }

  toggle_edit_mode() {
    this.edit_mode.update(value => {
      return !value
    })
  }
}
