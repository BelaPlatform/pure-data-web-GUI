import { writable, get } from 'svelte/store'
import * as G from '../utils/geometry'

import type { Pd } from './pd'
import { PdConnection } from './pd_connection'
import { PdWidget } from './pd_widget'
import { patch_directory } from '../stores/patches'
import { app } from '$lib/stores/app'

export type PopUp = {
  show: boolean
  origin: G.Point
  has_properties: boolean
  has_open: boolean
}

export type NodeType = 'obj' | 'msg' | 'floatatom' | 'symbolatom' | 'text' | 'bng' | 'toggle' | 'vslider' | 'hslider'

// events originating from pd are prefixed with handle_
// events originating from user interaction with the frontend are prefixed with on_
export class PdCanvas {
  title = writable<string>("")
  widgets = writable<PdWidget[]>([])
  connections = writable<PdConnection[]>([])
  is_mapped: boolean = false
  edit_mode = writable<boolean>(true)
  text_edit_mode_enabled = writable<boolean>(false)
  cursor = writable<string>('runmode_nothing')
  popup = writable<PopUp>({show: false, origin: G.NullPoint(), has_properties: false, has_open: false})
  size = writable<G.Size>(G.NullSize())
  required_size = writable<G.Size>(G.NullSize())
  origin = writable<G.Point>(G.NullPoint())
  scroll_pos = writable<G.Point>(G.NullPoint())

  constructor(public id: string, public pd: Pd, size: G.Size, origin: G.Point, set_edit_mode_on: boolean) {
    this.size.set(size)
    this.origin.set(origin)
    if (origin.x > 1000) {
      origin.x -= 1000
    }
    this.edit_mode.set(set_edit_mode_on)
  }

  handle_create_widget(id: string, klassname: string, x: number, y: number) {
    // does a widget with that id already exist?
    if (this.widget_with_id(id)) {
      return
    }
    const widget = new PdWidget(id, this, klassname, x, y)
    this.add_widget(widget)
  }

  widget_with_id(id: string): PdWidget | null {
    return get(this.widgets).find((w) => w.id == id) || null
  }

  private add_widget(widget: PdWidget) {
    this.widgets.update(ws => {
      ws.push(widget)
      return ws
    })

    const {x, y} = get(widget.box).bottom_right()
    const {width,height} = get(this.required_size)
    if (x > width || y > height) {
      this.required_size.update(_ => new G.Size(x, y))
    }
  }

  handle_widget_box_change(widget: PdWidget) {
    const {x, y} = get(widget.box).bottom_right()
    const {width,height} = get(this.required_size)
    let required_width = (x + 24) > width ? (x + 24) : width
    let required_height = (y + 24) > height ? (y + 24) : height
    if (required_width > width || required_height > height) {
      this.required_size.update(_ => new G.Size(required_width, required_height))
    }
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

  handle_delete_all() {
    this.widgets.update(_ => [])
    this.connections.update(_ => [])
  }

  handle_set_cursor(cursor_name: string) {
    this.cursor.update(_ => cursor_name)
  }
  
  private send_set_editmode(use_edit_mode: boolean) {
    const message = `${this.id} editmode ${use_edit_mode ? 1 : 0};`
    this.pd.send(message)
  }

  on_toggle_edit_mode() {
    const current = get(this.edit_mode)
    this.send_set_editmode(!current)
  }

  handle_set_editmode(use_edit_mode: boolean) {
    this.edit_mode.update(_ => use_edit_mode)
  }

  handle_set_title(title: string) {
    this.title.update(_ => title)
  }

  handle_raise() {
    this.pd.handle_raise_canvas(this)
  }

  handle_menuclose() {
    get(app).wm.on_show_save_dialog_for_canvas(this)
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

  on_save_as(name: string) {
    const directory = get(patch_directory)
    const message = `${this.id} savetofile ${name}.pd ${directory} 0;`
    this.pd.send(message)
  }

  get is_dirty() {
    const title = get(this.title)
    return title.includes('* ')
  }

  private send_simple_command(command: string) {
    const message = `${this.id} ${command};`
    this.pd.send(message)
  }

  on_put(node_type: NodeType) {
    switch (node_type) {
      case 'obj':
      case 'msg':
      case 'floatatom':
      case 'symbolatom':
      case 'text':
        this.pd.send(`${this.id} ${node_type} 0;`)
        break
      case 'bng':
      case 'toggle':
      case 'vslider':
      case 'hslider':
        this.send_simple_command(`${node_type}`)
    }
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

  on_redo() {
    this.send_simple_command('redo')
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
    // take scroll into account
    const scroll_pos = get(this.scroll_pos)
    const origin = new G.Point(x - scroll_pos.x, y - scroll_pos.y)
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

  on_set_size(size: G.Size) {
    this.size.update(_ => size)
    const origin = get(this.origin)
    const message = `${this.id} setbounds ${origin.x} ${origin.y} ${origin.x + size.width} ${origin.y + size.height};`
    this.pd.send(message)
  }

  handle_text_editing(text_edit_mode_is_enabled: boolean) {
    this.text_edit_mode_enabled.update(_ => text_edit_mode_is_enabled)
  }

  on_scroll(x: number, y: number) {
    this.scroll_pos.update(pos => {
      pos.x = x
      pos.y = y
      return pos
   })
  }
}
