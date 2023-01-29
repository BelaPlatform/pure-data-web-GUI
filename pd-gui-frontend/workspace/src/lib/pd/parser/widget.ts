import { get } from 'svelte/store'

import { pd } from '$lib/stores/pd'
import { PdWidget, IOLetScope, IOLetType, type WidgetState } from '../pd_widget'
import { PdConnection } from '../pd_connection'

function parse_create(message:string) {
  // console.log('::pdwidget::create')
  // console.log(message)
  const tokens = message.split(' ')

  const klass = tokens.at(1) || ""
  const id = tokens.at(2) || ""
  const canvas_id = (tokens.at(3) || "").split('.c')[0]

  const pd_ = get(pd)
  const canvas = pd_.canvas_with_id(canvas_id)
  if(!canvas) {
    console.log(`no canvas ${canvas_id}`)
    return
  }

  if (klass == 'connection') {
    canvas.create_connection(id)
  } else {
    const x = tokens.at(4) || ""
    const y = tokens.at(5) || ""
    canvas.create_widget(id, klass, parseInt(x), parseInt(y))
  }
}

// examples:
// ::pdwidget::create_inlets 0x1b729b0 {0.000000 } ;
// ::pdwidget::create_inlets 0x1b72b90 {0.000000 0.000000 0.000000 } ;
// ::pdwidget::create_inlets 0x25925f0 0 
// ::pdwidget::create_outlets 0x1b72b90 {0.000000 } ;
// ::pdwidget::create_outlets 0x1b729b0 {0.000000 0.000000 0.000000 0.000000 0.000000 0.000000 } ;
// ::pdwidget::create_outlets 0x25925f0 0 
function parse_create_iolets(message:string, scope:IOLetScope) {
  // console.log('parse_create_iolets')
  // console.log(message)
  const tokens = message.split(' ')
  const widget_id = tokens.at(1) || ""
  const pd_ = get(pd)
  const widget = pd_.widget_with_id(widget_id)
  if (!widget) { return }

  const left_brace = message.indexOf('{')
  const right_brace = message.indexOf('}')
  
  // there's just one iolet, sent as an int
  if (left_brace == -1) {
    const index = 0
    const type = parseInt(tokens[2]) == 0 ? IOLetType.Message : IOLetType.Signal
    widget.add_iolet(scope, type)
  } else {
    const let_descriptors = message.substring(left_brace+1, right_brace).split(' ')
    let_descriptors.forEach(d => {
      const trimmed = d.trim()
      if (trimmed.length == 0) {
        return
      }
      const type = parseFloat(trimmed) == 0.0 ? IOLetType.Message : IOLetType.Signal
      widget.add_iolet(scope, type)
    })
  }
}

type Property = {
  key: string
  value: string
}

function parse_properties(message:string) : Property[] {
  const properties:Property[] = []
  while (message.length != 0) {
    let key = ''
    let value = ''
    const key_start = message.indexOf('-')
    const key_end = message.indexOf('{')
    if (key_start != -1 && key_end != -1) {
      key = message.slice(key_start+1, key_end).trim()
    } else {
      return properties
    }

    message = message.slice(key_end + 1)
    const value_end = message.indexOf('}')
    if (value_end != -1) {
      value = message.slice(0, value_end).trim()
    } else {
      return properties
    }
    message = message.slice(value_end)

    properties.push({key, value})    
  }
  return properties
}

function widget_state_from_string(state: string) : WidgetState {
  switch(state) {
    case 'normal':
      return 'normal'
    case 'edit':
      return 'edit'
    case 'broken':
      return 'broken'
    default:
      return 'normal'
  }
}

function parse_config(message:string) {
  // console.log('parse_config')
  // console.log(message)
  const tokens = message.split(' ')
  const widget_id = tokens.at(1) || ""
  const pd_ = get(pd)
  const object = pd_.widget_or_connection_with_id(widget_id)
  const properties = parse_properties(message)
  if (object instanceof PdWidget) {
    // console.log(properties)
    properties.forEach(p => {
      switch(p.key) {
        case 'text': {
          object.set_text(p.value)
        } break;
        case 'size': {
          const size_tokens = p.value.split(' ')
          object.set_size(parseFloat(size_tokens[0].trim()), parseFloat(size_tokens[1].trim()))
        } break;
        case 'state': {
          const state = widget_state_from_string(p.value)
          object.set_state(state)
        } break;
      }
    })
  } else if (object instanceof PdConnection) {
    properties.forEach(p => {
      switch(p.key) {
        case 'position': {
          const coordinate_tokens = p.value.split(' ')
          const from_x = parseFloat(coordinate_tokens[0].trim())
          const from_y = parseFloat(coordinate_tokens[1].trim())
          const to_x = parseFloat(coordinate_tokens[2].trim())
          const to_y = parseFloat(coordinate_tokens[3].trim())
          object.set_coordinates(from_x, from_y, to_x, to_y)
        } break;
      }
    })
  }
}

function parse_bang_or_toggle_activate(message:string) {
  // console.log('parse_bang_activate')
  // console.log(message)
  const tokens = message.split(' ')
  const widget_id = tokens.at(1) || ""
  const pd_ = get(pd)
  const object = pd_.widget_with_id(widget_id)
  if (!object) {
    return
  }

  const value = tokens.at(2) || "0"
  object.set_is_activated(parseInt(value) == 1)
  // console.log(object)
}

function parse_displace(message:string) {
  // console.log('parse_displace')
  const tokens = message.split(' ')
  const widget_id = tokens.at(1) || ""
  // console.log(tokens)
  const pd_ = get(pd)
  const widget = pd_.widget_with_id(widget_id)
  if (!widget) {
    return
  }

  const x = parseInt(tokens.at(2) || "0")
  const y = parseInt(tokens.at(3) || "0")
  widget.displace_origin(x, y)
}

function parse_moveto(message:string) {
  const tokens = message.split(' ')
  const widget_id = tokens.at(1) || ""
  const pd_ = get(pd)
  const widget = pd_.widget_with_id(widget_id)
  if (!widget) {
    return
  }

  const x = parseInt(tokens.at(3) || "0")
  const y = parseInt(tokens.at(4) || "0")
  widget.set_origin(x, y)
}


function parse_destroy(message: string) {
  const tokens = message.split(' ')
  const object_id = tokens.at(1) || ""
  const pd_ = get(pd)
  const object = pd_.widget_or_connection_with_id(object_id)
  object?.canvas.destroy(object)
}

function parse_select(message: string) {
  const tokens = message.split(' ')
  const object_id = tokens.at(1) || ""
  const pd_ = get(pd)
  const object = pd_.widget_or_connection_with_id(object_id)
  if (!object) {
    return
  }
  const selected = parseInt(tokens.at(2) || "0") == 1
  object.set_is_selected(selected)
}

export function parse_widget_message(message:string) {
  if (message.startsWith("::pdwidget::create_inlets")) {
    parse_create_iolets(message, IOLetScope.Input)
    return
  }

  if (message.startsWith("::pdwidget::create_outlets")) {
    parse_create_iolets(message, IOLetScope.Output)
    return
  }

  if (message.startsWith("::pdwidget::create")) {
    parse_create(message)
    return
  }

  if (message.startsWith("::pdwidget::config")) {
    parse_config(message)
  }

  if (message.startsWith("::pdwidget::select")) {
    // console.log('::pdwidget::select')
  }

  if (message.startsWith("::pdwidget::create_inlets")) {
    // console.log('::pdwidget::create_inlets')
  }

  if (message.startsWith("::pdwidget::create_outlets")) {
    // console.log('::pdwidget::create_outlets')
  }

  if (message.startsWith("::pdwidget::bang::activate") 
    || message.startsWith("::pdwidget::toggle::activate")) {
    parse_bang_or_toggle_activate(message)
  }

  if (message.startsWith("::pdwidget::displace")) {
    parse_displace(message)
  }

  if (message.startsWith("::pdwidget::moveto")) {
    parse_moveto(message)
  }

  if (message.startsWith("::pdwidget::destroy")) {
    parse_destroy(message)
  }

  if (message.startsWith("::pdwidget::select")) {
    parse_select(message)
  }
}