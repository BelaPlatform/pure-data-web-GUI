import { get } from 'svelte/store'

import { pd } from '$lib/stores/pd'
import { parse_window_message } from './window'
import { parse_pdtk_canvas_message, parse_canvas_message } from './canvas'
import { parse_widget_message } from './widget'

export function parse(full_message:string) {
  // console.log(full_message)
  const messages = full_message.split(';\n')
  // console.log(messages)
  messages.forEach(message => {
    // console.log(`parsing ${message}`)
    if (message.startsWith("::pdwindow")) {
      parse_window_message(message)
    }

    if (message.startsWith("pdtk_canvas")) {
      parse_pdtk_canvas_message(message)
    }

    if (message.startsWith("::pd::canvas")) {
      parse_canvas_message(message)
    }

    if (message.startsWith("::pdwidget")) {
      parse_widget_message(message)
    }

    if (message.startsWith("pdtk_ping")) {
      get(pd).send_ping()
    }

    if (message.startsWith("destroy")) {
      const tokens = message.split(' ')
      const canvas_id = tokens.at(1) || "0"
      const pd_ = get(pd)
      const canvas = pd_.canvas_with_id(canvas_id)
      if (!canvas) {
        return
      }
      pd_.handle_destroy(canvas)
    }
  })
}