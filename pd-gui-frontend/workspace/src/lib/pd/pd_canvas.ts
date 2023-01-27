import { writable, get } from 'svelte/store'

import type { PdWidget } from './pd_widget'


export class PdCanvas {
  title: string = ""
  is_mapped: boolean = false
  widgets = writable<PdWidget[]>([])

  constructor(public id: string) {}

  add_widget(widget:PdWidget) {
    // console.log('add_widget')
    this.widgets.update(_ => {
      const ws = get(this.widgets)
      ws.push(widget)
      return ws
    })
  }
}
