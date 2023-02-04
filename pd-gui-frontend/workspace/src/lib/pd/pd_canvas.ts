import { writable, get } from 'svelte/store'
import * as G from './geometry'

import type { Pd } from './pd'
import { PdConnection } from './pd_connection'
import { PdWidget } from './pd_widget'

export type PopUp = {
  show: boolean
  origin: G.Point
  has_properties: boolean
  has_open: boolean
}

// events originating from pd are prefixed with handle_
// events originating from user interaction with the frontend are prefixed with on_
export class PdCanvas {
  title = writable<string>("")
  widgets = writable<PdWidget[]>([])
  connections = writable<PdConnection[]>([])
  is_mapped: boolean = false
  edit_mode = writable<boolean>(false)
  cursor = writable<string>('runmode_nothing')
  popup = writable<PopUp>({show: false, origin: G.NullPoint(), has_properties: false, has_open: false})

  constructor(public id: string, public pd: Pd) { }

  handle_create_widget(id:string, klassname:string, x:number, y:number) {
    const widget = new PdWidget(id, this, klassname, x, y)
    this.add_widget(widget)
  }

  private add_widget(widget: PdWidget) {
    this.widgets.update(ws => {
      ws.push(widget)
      return ws
    })
  }

  handle_create_connection(id: string) {
    const connection = new PdConnection(id, this)
    this.add_connection(connection)
  }

  private add_connection(connection:PdConnection) {
    this.connections.update(cs => {
      cs.push(connection)
      return cs
    })
  }

  handle_destroy(object: PdWidget|PdConnection) {
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

  handle_set_cursor(cursor_name: string) {
    this.cursor.update(_ => cursor_name)
  }
  
  private send_set_editmode(use_edit_mode: boolean) {
    const message = `${this.id} editmode ${use_edit_mode ? 1 : 0};`
    this.pd.send(message)
  }

  on_toggle_edit_mode() {
    this.edit_mode.update(value => {
      this.send_set_editmode(!value)
      return value
    })
  }

  handle_set_editmode(use_edit_mode: boolean) {
    this.edit_mode.update(_ => use_edit_mode)
  }

  handle_set_title(title: string) {
    this.title.update(_ => title)
  }

  // modifers:
  // SHIFT = 1
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

  private send_key(key: string, keydown: boolean, modifiers: number) {
    const message = `${this.id} key ${keydown ? 1 : 0} ${key} ${modifiers};`
    this.pd.send(message)
  }

  send_key_down(key: string, modifiers: number = 0) {
    this.send_key(key, true, modifiers)
  }

  send_key_up(key: string) {
    this.send_key(key, false, 0)
  }

  on_save() {
    const message = `${this.id} menusave;`
    this.pd.send(message)
  }

  on_create_object() {
    const message = `${this.id} obj 0;`
    this.pd.send(message)
  }

  on_create_message() {
    const message = `${this.id} msg 0;`
    this.pd.send(message)
  }

  on_create_number() {
    const message = `${this.id} floatatom 0;`
    this.pd.send(message)
  }

  on_create_comment() {
    const message = `${this.id} text 0;`
    this.pd.send(message)
  }

  private send_simple_command(command: string) {
    const message = `${this.id} ${command};`
    this.pd.send(message)
  }

  on_create_bang() {
    this.send_simple_command('bng')
  }

  on_create_toggle() {
    this.send_simple_command('toggle')
  }

  on_select_all() {
    this.send_simple_command('selectall')
  }

  on_copy() {
    this.send_simple_command('copy')
  }

  on_paste() {
    this.send_simple_command('paste')
  }

  on_cut() {
    this.send_simple_command('cut')
  }

  on_undo() {
    this.send_simple_command('undo')
  }

  on_duplicate() {
    this.send_simple_command('duplicate')
  }

  on_tidy() {
    this.send_simple_command('tidy')
  }

  on_connect_selection() {
    this.send_simple_command('connect_selection')
  }
  
  handle_popup(x: number, y: number, has_properties: boolean, has_open: boolean) {
    const origin = new G.Point(x, y)
    const show = true
    this.popup.update(_ => {
      return {show, origin, has_properties, has_open}
    })
  }

  on_dismiss_popup() {
    this.popup.update(p => {
      p.show = false
      return p
    })
  }

  on_dismiss_popup_with_result(value: number) {
    const popup_ = get(this.popup)
    const message = `${this.id} done-popup ${value} ${popup_.origin.x} ${popup_.origin.y};`
    this.pd.send(message)
    this.on_dismiss_popup()
  }
}
