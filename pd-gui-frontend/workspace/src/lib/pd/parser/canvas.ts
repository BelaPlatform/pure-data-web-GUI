import { get } from 'svelte/store'

import { pd } from '$lib/stores/pd'

export function parse_pdtk_canvas_message(message:string) {
  const tokens = message.split(' ')
  const id = tokens.at(1) || ""  
  const pd_ = get(pd)

  if (message.startsWith("pdtk_canvas_new")) {
    get(pd).handle_new_canvas_with_id(id)
    // this canvas has just been opened by us
    // send a map message on user's behalf
    pd_.on_map_canvas_with_id(id)
    return
  }

  if (message.startsWith("pdtk_canvas_setparents")) {
    // console.log('pdtk_setparents')
    return
  }

  const canvas = pd_.canvas_with_id(id)
  if (!canvas) {
    console.log(`no canvas with id ${id}`)
    return
  }

  if (message.startsWith("pdtk_canvas_reflecttitle")) {
    const title = (tokens.at(3) || "").replace('{', '').replace('}', '')
    canvas.title = title
    return
  }

  if (message.startsWith("pdtk_canvas_popup")) {
    const x = parseInt(tokens.at(2) || "0")
    const y = parseInt(tokens.at(3) || "0")
    const has_properties = parseInt(tokens.at(4) || "0") == 1
    const has_open = parseInt(tokens.at(5) || "0") == 1
    canvas.handle_popup(x, y, has_properties, has_open)
  }
}

function parse_set_cursor_message(message:string) {
  // console.log('parse_set_cursor_message')
  // console.log(message)
  const pd_ = get(pd)
  const tokens = message.split(' ')
  // console.log(tokens)
  const id = tokens.at(1) || ""
  // console.log(id)
  const canvas_id = id.split('.c').at(0) || ""
  // console.log(canvas_id)
  const canvas = get(pd).canvas_with_id(canvas_id)
  // console.log(canvas)
  if (!canvas) {
    return
  }
  const cursor = tokens.at(2) || ""
  canvas.handle_set_cursor(cursor)
}

function parse_set_editmode_message(message: string) {
  const pd_ = get(pd)
  const tokens = message.split(' ')
  // console.log(tokens)
  const id = tokens.at(1) || ""
  // console.log(id)
  const canvas_id = id.split('.c').at(0) || ""
  // console.log(canvas_id)
  const canvas = get(pd).canvas_with_id(canvas_id)
  // console.log(canvas)
  if (!canvas) {
    return
  }
  const use_edit_mode = parseInt(tokens.at(2) || "") == 1
  canvas.handle_set_editmode(use_edit_mode)
}

export function parse_canvas_message(message: string) {
  if (message.startsWith("::pd::canvas::set_cursor")) {
    parse_set_cursor_message(message) 
  }

  if (message.startsWith("::pd::canvas::set_editmode")) {
    parse_set_editmode_message(message) 
  }
}
