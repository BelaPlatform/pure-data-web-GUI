import { writable, get } from 'svelte/store'

import type { PdConnection } from './pd_connection'
import type { PdWidget } from './pd_widget'


export class PdCanvas {
  title: string = ""
  is_mapped: boolean = false
  widgets = writable<PdWidget[]>([])
  connections = writable<PdConnection[]>([])

  constructor(public id: string) {}

  add_widget(widget:PdWidget) {
    // console.log('add_widget')
    this.widgets.update(_ => {
      const ws = get(this.widgets)
      ws.push(widget)
      return ws
    })
  }

  add_connection(connection:PdConnection) {
    // console.log('add_widget')
    this.connections.update(_ => {
      const cs = get(this.connections)
      cs.push(connection)
      return cs
    })
  }
}
