import { Command } from './command'
import type { Pd } from '../../pd'
import { PdWidget, IOLetScope, IOLetType, type WidgetState } from '../../pd_widget'
import { PdConnection, PdConnectionType } from '../../pd_connection'
import { NumberNode, StringNode, VectorNode, type ValueNode } from '../syntax_nodes'
import * as G from '../../../utils/geometry'

export class Create extends Command {
  constructor(public klass: string, 
    public widget_id: string,
    public canvas_id: string,
    public origin_x: number,
    public origin_y: number) {
    super()
  }

  override eval(pd: Pd) {
    const canvas = pd.canvas_with_id(this.canvas_id)
    if (!canvas) {
      return
    }

    if (this.klass == 'connection') {
      canvas.handle_create_connection(this.widget_id)
    } else {
      canvas.handle_create_widget(this.widget_id, this.klass, this.origin_x, this.origin_y)
    }
  }
}

export class Destroy extends Command {
  constructor(public widget_id: string) {
    super()
  }

  override eval(pd: Pd) {
    const object = pd.widget_or_connection_with_id(this.widget_id)
    if (!object) {
      return
    }
    const canvas = object.canvas
    canvas.handle_destroy(object)
  }
}

export type Property = {
  key: string
  value: ValueNode
}

export class Config extends Command {
  constructor(public widget_id: string,
    public properties: Property[]) {
    super()
  }

  override eval(pd: Pd) {
    const object = pd.widget_or_connection_with_id(this.widget_id)
    if (object instanceof PdWidget) {
      // console.log(object.id)
      this.properties.forEach(p => {
        switch(p.key) {
          case 'text': {
            if (p.value instanceof StringNode) {
              let text = (p.value as StringNode).value
              text = text.replace('\\[', '[')
              text = text.replace('\\]', ']')
              object.set_text(text)
            } else if (p.value instanceof VectorNode) {
              object.set_text(p.value.as_text())
            }
          } break;
          case 'size': {
            if (p.value instanceof VectorNode) {
              const values = p.value as VectorNode
              const width = parseFloat((values.elements[0] as NumberNode).value)
              const height = parseFloat((values.elements[1] as NumberNode).value)
              object.set_size(width, height)
            }
          } break;
          case 'visible': {
            if (p.value instanceof VectorNode) {
              const values = p.value as VectorNode
              const width = parseFloat((values.elements[0] as NumberNode).value)
              const height = parseFloat((values.elements[1] as NumberNode).value)
              object.set_size(width, height)
            }
          } break;
          case 'state': {
            if (p.value instanceof StringNode) {
              const state_name = (p.value as StringNode).value
              const state = this.widget_state_from_string(state_name)
              object.set_state(state)
            }
          } break;
          case 'bcolor': {
            if (p.value instanceof StringNode) {
              const color = (p.value as StringNode).value
              object.set_bcolor(color)
            }
          } break;
          case 'fcolor': {
            if (p.value instanceof StringNode) {
              const color = (p.value as StringNode).value
              object.set_fcolor(color)
            }
          } break;
          case 'lcolor': {
            if (p.value instanceof StringNode) {
              const color = (p.value as StringNode).value
              object.set_lcolor(color)
            }
          } break;
          case 'label': {
            if (p.value instanceof StringNode) {
              const text = (p.value as StringNode).value
              object.set_label(text)
            }
          } break;
          case 'labelpos': {
            if (p.value instanceof VectorNode) {
              const vec = p.value as VectorNode
              const origin_x = parseFloat((vec.elements[0] as NumberNode).value)
              const origin_y = parseFloat((vec.elements[1] as NumberNode).value)
              object.set_labelpos(new G.Point(origin_x, origin_y))
            }
          } break;
          case 'fontsize': {
            if (p.value instanceof NumberNode) {
              const size = parseInt((p.value as NumberNode).value)
              object.set_fontsize(size)
            }
          } break;
          case 'font': {
            if (p.value instanceof StringNode) {
              const font = (p.value as StringNode).value
              object.set_font(font)
            }
          } break;
        }
      })
    } else if (object instanceof PdConnection) {
      this.properties.forEach(p => {
        switch(p.key) {
          case 'position': {
            if (p.value instanceof VectorNode) {
              const values = p.value as VectorNode
              const from_x = parseFloat((values.elements[0] as NumberNode).value)
              const from_y = parseFloat((values.elements[1] as NumberNode).value)
              const to_x = parseFloat((values.elements[2] as NumberNode).value)
              const to_y = parseFloat((values.elements[3] as NumberNode).value)
              object.set_coordinates(from_x, from_y, to_x, to_y)
            }
          } break;
          case 'type': {
            if (p.value instanceof StringNode) {
              const type_name = (p.value as StringNode).value
              object.set_type(type_name == 'message' ? PdConnectionType.Message : PdConnectionType.Signal)
            }
          } break;
        }
      })
    }
  }

  widget_state_from_string(state: string) : WidgetState {
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
}

export class CreateIOLet extends Command {
  constructor(public widget_id: string,
    public scope: IOLetScope,
    public iolet_types: IOLetType[]) {
    super()
  }

  override eval(pd: Pd) {
    const widget = pd.widget_with_id(this.widget_id)
    if (!widget) { return }
    this.iolet_types.forEach(io_type => {
      widget.add_iolet(this.scope, io_type)
    })
  }
}

export class Displace extends Command {
  constructor(public widget_id: string,
    public x: number,
    public y: number) {
    super()
  }

  override eval(pd: Pd) {
    const widget = pd.widget_with_id(this.widget_id)
    if (!widget) { return }
    widget.displace_origin(this.x, this.y)
  }
}

export class MoveTo extends Command {
  constructor(public widget_id: string,
    public canvas_id: string,
    public x: number,
    public y: number) {
    super()
  }

  override eval(pd: Pd) {
    const widget = pd.widget_with_id(this.widget_id)
    if (!widget) { return }
    widget.set_origin(this.x, this.y)
  }
}

export class Select extends Command {
  constructor(public widget_id: string,
    public is_selected: boolean) {
    super()
  }

  override eval(pd: Pd) {
    const object = pd.widget_or_connection_with_id(this.widget_id)
    if (!object) { return }
    object.set_is_selected(this.is_selected)
  }
}

export class Activate extends Command {
  constructor(public widget_id: string,
    public is_activated: boolean) {
    super()
  }

  override eval(pd: Pd) {
    const widget = pd.widget_with_id(this.widget_id)
    if (!widget) { return }
    widget.set_is_activated(this.is_activated)
  }
}

export class TextSelect extends Command {
  constructor(public widget_id: string,
    public start: number, public end: number) {
    super()
  }

  override eval(pd: Pd) {
    const widget = pd.widget_with_id(this.widget_id)
    if (!widget) { return }
    widget.handle_text_selection(this.start, this.end)
  }
}
