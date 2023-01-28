import { get } from 'svelte/store'

import { pd } from '$lib/stores/pd'
import { parse_window_message } from './window'
import { parse_canvas_message } from './canvas'
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
      parse_canvas_message(message)
    }

    if (message.startsWith("::pdwidget")) {
      parse_widget_message(message)
    }

    if (message.startsWith("pdtk_ping")) {
      get(pd).send_ping()
    }
  })
}