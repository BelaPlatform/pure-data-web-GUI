import { get } from 'svelte/store'

import { pd } from '../pd'
import { PdWidget, IOLetScope, type IOLet, IOLetType } from '../pd_widget'
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
    const connection = new PdConnection(id)
    canvas.add_connection(connection)
  } else {
    const x = tokens.at(4) || ""
    const y = tokens.at(5) || ""
    const widget = new PdWidget(id, klass, parseInt(x), parseInt(y))
    canvas.add_widget(widget)
    // console.log(widget)
  }
}

// examples:
// ::pdwidget::create_inlets 0x1b729b0 {0.000000 } ;
// ::pdwidget::create_inlets 0x1b72b90 {0.000000 0.000000 0.000000 } ;
// ::pdwidget::create_outlets 0x1b72b90 {0.000000 } ;
// ::pdwidget::create_outlets 0x1b729b0 {0.000000 0.000000 0.000000 0.000000 0.000000 0.000000 } ;
function parse_create_iolets(message:string, scope:IOLetScope) {
  const tokens = message.split(' ')
  const widget_id = tokens.at(1) || ""
  const pd_ = get(pd)
  const widget = pd_.widget_with_id(widget_id)
  if (!widget) { return }

  const iolets:IOLet[] = []
  const left_brace = message.indexOf('{')
  const right_brace = message.indexOf('}')
  const let_descriptors = message.substring(left_brace+1, right_brace).split(' ')
  let index = 0
  let_descriptors.forEach(d => {
    // console.log(d)
    const trimmed = d.trim()
    if (trimmed.length == 0) {
      return
    }
    const type = parseFloat(trimmed) == 0.0 ? IOLetType.Message : IOLetType.Signal
    iolets.push({index, widget, scope, type})
    ++index
  })
  // console.log(let_descriptors)

  switch (scope) {
    case IOLetScope.Input:
      widget.inlets = iolets
      break;
    case IOLetScope.Output:
      widget.outlets = iolets
      break;
  }
}

type Property = {
  key: string
  value: string
}

function parse_properties(message:string) : Property[] {
  // console.log(tokens)
  // let idx = 0
  const properties:Property[] = []
  let idx = 0
  
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
    // console.log(`key: ${key}`)
    message = message.slice(key_end + 1)
    // const value_start = message.indexOf('{')
    const value_end = message.indexOf('}')
    if (value_end != -1) {
      value = message.slice(0, value_end).trim()
    } else {
      return properties
    }
    // console.log(`value: ${value}`)
    message = message.slice(value_end)
    properties.push({key, value})    
  }
  return properties
}

function parse_config(message:string) {
  // console.log('parse_config')
  console.log(message)
  const tokens = message.split(' ')
  const widget_id = tokens.at(1) || ""
  const pd_ = get(pd)
  const object = pd_.widget_or_connection_with_id(widget_id)
  // console.log(object)
  // if (!widget) { return }
  const properties = parse_properties(message)
  if (object instanceof PdWidget) {
    // console.log(properties)
    properties.forEach(p => {
      switch(p.key) {
        case 'text': {
          object.text = p.value
        } break;
        case 'size': {
          const size_tokens = p.value.split(' ')
          object.box.size.width = parseFloat(size_tokens[0].trim())// * 4.0
          object.box.size.height = parseFloat(size_tokens[1].trim())// * 4.0
        } break;
      }
    })
  } else if (object instanceof PdConnection) {
    properties.forEach(p => {
      switch(p.key) {
        case 'position': {
          const coordinate_tokens = p.value.split(' ')
          object.from.x = parseFloat(coordinate_tokens[0].trim())
          object.from.y = parseFloat(coordinate_tokens[1].trim())
          object.to.x = parseFloat(coordinate_tokens[2].trim())
          object.to.y = parseFloat(coordinate_tokens[3].trim())
        } break;
      }
    })
  }
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
}