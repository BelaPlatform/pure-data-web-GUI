import { writable, get } from 'svelte/store'

import type { Pd } from './pd'
import { PdConnection } from './pd_connection'
import { PdWidget } from './pd_widget'


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

  create_widget(id:string, klassname:string, x:number, y:number) {
    const widget = new PdWidget(id, this, klassname, x, y)
    this.add_widget(widget)
  }

  private add_widget(widget: PdWidget) {
    this.widgets.update(ws => {
      ws.push(widget)
      return ws
    })
  }

  create_connection(id: string) {
    const connection = new PdConnection(id, this)
    this.add_connection(connection)
  }

  private add_connection(connection:PdConnection) {
    this.connections.update(cs => {
      cs.push(connection)
      return cs
    })
  }

  destroy(object: PdWidget|PdConnection) {
    if (object instanceof PdWidget) {
      this.widgets.update(ws => {
        ws = ws.filter((obj) => {
          return obj.id != object.id
        })
        return ws
      })
    }

    if (object instanceof PdConnection) {
      this.connections.update(cs => {
        cs = cs.filter((obj) => {
          return obj.id != object.id
        })
        return cs
      })
    }    
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

  // modifers:
  // CTRL = 2
  // ALT = 4
  // CTRL + ALT = 6
  send_mouse_down(x: number, y: number, button: number, modifiers: number) {
    const message = `${this.id} mouse ${x * 1.0} ${y * 1.0} ${button} ${modifiers};`
    this.pd.send(message)
  }

  send_mouse_up(x: number, y: number, button: number) {
    const message = `${this.id} mouseup ${x * 1.0} ${y * 1.0} 1 0;`
    this.pd.send(message)
  }

  send_motion(x: number, y: number, modifiers: number) {
    const message = `${this.id} motion ${x * 1.0} ${y * 1.0} ${modifiers};`
    this.pd.send(message)
  }

  private send_key(key: string, keydown: boolean) {
    const message = `${this.id} key ${keydown ? 1 : 0} ${key} 0;`
    this.pd.send(message)
  }

  send_key_down(key: string) {
    this.send_key(key, true)
  }

  send_key_up(key: string) {
    this.send_key(key, false)
  }

  toggle_edit_mode() {
    this.edit_mode.update(value => {
      return !value
    })
  }
}
