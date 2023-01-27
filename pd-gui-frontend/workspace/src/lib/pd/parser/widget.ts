import { get } from 'svelte/store'

import { pd } from '../pd'
import { PdWidget } from '../pd_widget'

function parse_create(message:string) {
  console.log('::pdwidget::create')
  console.log(message)
  const tokens = message.split(' ')

  const klass = tokens.at(1) || ""
  const id = tokens.at(2) || ""
  const canvas_id = (tokens.at(3) || "").split('.c')[0]
  const x = tokens.at(4) || ""
  const y = tokens.at(5) || ""

  const pd_ = get(pd)
  const canvas = pd_.canvas_with_id(canvas_id)
  if(!canvas) {
    console.log(`no canvas ${canvas_id}`)
    return
  }

  if (klass == 'connection') {
    // console.log("klass == 'connection'")
  } else {
    const widget = new PdWidget(id, klass, parseInt(x), parseInt(y))
    canvas.add_widget(widget)
    // console.log(widget)
  }
}

function parse_create_inlets(message:string) {
  console.log('parse_create_inlets')
  console.log(message)
}

function parse_create_outlets(message:string) {
  console.log('parse_create_outlets')
  console.log(message)
}

export function parse_widget_message(message:string) {
  if (message.startsWith("::pdwidget::create_inlets")) {
    parse_create_inlets(message)
    return
  }

  if (message.startsWith("::pdwidget::create_outlets")) {
    parse_create_outlets(message)
    return
  }

  if (message.startsWith("::pdwidget::create")) {
    parse_create(message)
    return
  }

  if (message.startsWith("::pdwidget::config")) {
    // console.log('::pdwidget::config')
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