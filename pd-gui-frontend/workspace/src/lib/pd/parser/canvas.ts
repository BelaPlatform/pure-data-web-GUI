import { get } from 'svelte/store'

import { pd } from '../pd'

export function parse_canvas_message(message:string) {
  const pd_ = get(pd)
  if (message.startsWith("pdtk_canvas_new")) {
    const tokens = message.split(' ')
    const id = tokens.at(1) || ""
    get(pd).new_canvas_with_id(id)

    // this canvas has just been opened by us
    // send a map message
    pd_.map_canvas_with_id(id)
  }

  if (message.startsWith("pdtk_canvas_setparents")) {
    console.log('pdtk_setparents')
  }

  if (message.startsWith("pdtk_canvas_reflecttitle")) {
    console.log('pdtk_canvas_reflecttitle')
    console.log(message)
    const tokens = message.split(' ')
    const id = tokens.at(1) || ""
    const canvas = pd_.canvas_with_id(id)
    if (!canvas) {
      console.log(`no canvas with id ${id}`)
      return
    }
    const title = (tokens.at(3) || "").replace('{', '').replace('}', '')
    console.log(title)
    canvas.title = title
  }
}