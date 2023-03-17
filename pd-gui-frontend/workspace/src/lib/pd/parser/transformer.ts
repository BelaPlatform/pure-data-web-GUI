import { UnrecognizedCommand, IgnoredCommand, type Command } from './commands/command'
import { type Identifier, NumberNode, type RootNode, StringNode, VectorNode, type PropertyNode, type ValueNode } from './syntax_nodes'
import * as PdCommands from './commands/pd_commands'
import * as PdWindowCommands from './commands/pd_window_commands'
import * as CanvasCommands from './commands/canvas_commands'
import * as WidgetCommands from './commands/widget_commands'
import { type IOLetType, IOLetScope } from '../pd_widget'
import * as G from '../../utils/geometry'


function clean_canvas_id(cid: string) {
  if (cid.endsWith('.c')) {
    return cid.split('.c')[0]
  }
  return cid
}

export function transform(root: RootNode) : Command[] {
  const commands : Command[] = []
  root.procs.forEach(proc => {
    
    // *******
    // pd commands
    // *******
    if (proc.id.name == 'pdtk_watchdog') {
      commands.push(new PdCommands.Watchdog())
      return
    }

    if (proc.id.name == 'pdtk_ping') {
      commands.push(new PdCommands.Ping())
      return
    }

    if (proc.id.name == 'pdtk_pd_dsp') {
      const dsp_arg = proc.arguments[0] as StringNode
      const dsp_is_on = dsp_arg.value == "ON"
      commands.push(new PdCommands.Dsp(dsp_is_on))
      return
    }

    if (proc.id.name == 'pdtk_undomenu') {
      commands.push(new IgnoredCommand('pdtk_undomenu'))
      return
    }

    if (proc.id.name == 'update_window_menu') {
      commands.push(new IgnoredCommand('update_window_menu'))
      return
    }

    if (proc.id.name == 'set') {
      commands.push(new IgnoredCommand('set'))
      return
    }

    // *******
    // pd window commands
    // *******
    if (proc.id.name == 'post') {
      const message_arg = proc.arguments[0] as StringNode
      const message = message_arg.value
      commands.push(new PdWindowCommands.Post(message))
      return
    }

    if (proc.id.name == 'logpost') {
      if (proc.arguments.length >= 3) {
        const message_arg = proc.arguments[2] as StringNode
        const message = message_arg.value
        commands.push(new PdWindowCommands.Post(message))
      }
      return
    }

    // *******
    // canvas commands
    // *******
    if (proc.id.name == 'pdtk_canvas_getscroll') {
      const canvas_arg = proc.arguments[0] as Identifier
      const canvas_id = canvas_arg.name
      commands.push(new CanvasCommands.GetScroll(canvas_id))
      return
    }

    if (proc.id.name == 'pdtk_canvas_setparents') {
      const canvas_arg = proc.arguments[0] as Identifier
      const canvas_id = canvas_arg.name
      commands.push(new CanvasCommands.SetParents(canvas_id))
      return
    }

    if (proc.id.name == 'pdtk_text_editing') {
      const canvas_arg = proc.arguments[0] as Identifier
      const text_editing_is_enabled = (parseInt((proc.arguments[2] as NumberNode).value || "0") || 0) == 1
      const canvas_id = canvas_arg.name
      commands.push(new CanvasCommands.TextEditing(canvas_id, text_editing_is_enabled))
      return
    }

    if (proc.id.name == 'pdtk_canvas_reflecttitle') {
      const canvas_arg = proc.arguments[0] as Identifier
      const canvas_id = canvas_arg.name
      const directory_arg = proc.arguments[1] as StringNode
      const title_arg = proc.arguments[2] as StringNode
      const mode_arg = proc.arguments[3]
      let mode = ""
      if (mode_arg instanceof StringNode) {
        mode = mode_arg.value
      }
      const is_unsaved_arg = proc.arguments[4]
      let is_unsaved = false
      if (is_unsaved_arg instanceof NumberNode) {
        is_unsaved = parseInt(is_unsaved_arg.value) == 1
      }
      commands.push(new CanvasCommands.ReflectTitle(canvas_id, directory_arg.value, title_arg.value, mode, is_unsaved))
      return
    }

    if (proc.id.name == 'pdtk_canvas_new') {
      const canvas_arg = proc.arguments[0] as Identifier
      const canvas_id = canvas_arg.name
      const width = parseInt((proc.arguments[1] as NumberNode).value)
      const height = parseInt((proc.arguments[2] as NumberNode).value)
      const set_edit_mode_on = parseInt((proc.arguments[4] as NumberNode).value) == 1
      commands.push(new CanvasCommands.NewCanvas(canvas_id, new G.Size(width, height), set_edit_mode_on))
      return
    }

    if (proc.id.name == 'pdtk_canvas_raise') {
      const canvas_arg = proc.arguments[0] as Identifier
      const canvas_id = canvas_arg.name
      commands.push(new CanvasCommands.Raise(canvas_id))
      return
    }

    if (proc.id.name == 'set_cursor') {
      const canvas_id_arg = proc.arguments[0] as Identifier
      let canvas_id = clean_canvas_id(canvas_id_arg.name)
      const cursor_arg = proc.arguments[1] as Identifier
      const cursor = cursor_arg.name
      commands.push(new CanvasCommands.SetCursor(canvas_id, cursor))
      return
    }

    if (proc.id.name == 'set_zoom') {
      const canvas_id_arg = proc.arguments[0] as Identifier
      let canvas_id = clean_canvas_id(canvas_id_arg.name)
      const zoom_arg = proc.arguments[1] as NumberNode
      const value = parseInt(zoom_arg.value) || 0
      commands.push(new CanvasCommands.SetZoom(canvas_id, value))
      return
    }

    if (proc.id.name == 'set_editmode') {
      const canvas_id_arg = proc.arguments[0] as Identifier
      let canvas_id = clean_canvas_id(canvas_id_arg.name)
      const use_editmode_arg = proc.arguments[1] as NumberNode
      const use_editmode = (parseInt(use_editmode_arg.value) || 0) == 1
      commands.push(new CanvasCommands.SetEditMode(canvas_id, use_editmode))
      return
    }

    if (proc.id.name == 'pdtk_canvas_popup') {
      const canvas_arg = proc.arguments[0] as Identifier
      const canvas_id = canvas_arg.name
      const origin_x_arg = proc.arguments[1] as NumberNode
      const origin_y_arg = proc.arguments[2] as NumberNode
      const show_properties_arg = proc.arguments[3] as NumberNode
      const show_open_arg = proc.arguments[4] as NumberNode
      commands.push(new CanvasCommands.PopUp(canvas_id, 
          parseInt(origin_x_arg.value),
          parseInt(origin_y_arg.value),
          parseInt(show_properties_arg.value) == 1,
          parseInt(show_open_arg.value) == 1
          ))
      return
    }

    // *******
    // widget commands
    // *******
    if (proc.id.name == 'create') {
      const widget_type_arg = proc.arguments[0] as Identifier
      const widget_id_arg = proc.arguments[1] as Identifier
      const canvas_id_arg = proc.arguments[2] as Identifier
      const origin_x_arg = proc.arguments[3] as NumberNode
      const origin_y_arg = proc.arguments[4] as NumberNode

      const widget_type = widget_type_arg.name
      const widget_id = widget_id_arg.name
      let canvas_id = canvas_id_arg.name
      if (canvas_id.endsWith('.c')) {
        canvas_id = canvas_id.split('.c')[0]
      }
      const origin_x = parseInt(origin_x_arg.value) || 0
      const origin_y = parseInt(origin_y_arg.value) || 0
      commands.push(new WidgetCommands.Create(widget_type, widget_id, canvas_id, origin_x, origin_y))
      return
    }

    if (proc.id.name == 'destroy') {
      const widget_id_arg = proc.arguments[0] as Identifier
      const widget_id = widget_id_arg.name
      commands.push(new WidgetCommands.Destroy(widget_id))
      return
    }

    if (proc.id.name == 'config') {
      const widget_id_arg = proc.arguments[0] as Identifier
      const property_args = proc.arguments.slice(1)

      let properties: WidgetCommands.Property[] = []
      property_args.forEach(p => {
        const property = p as PropertyNode
        const key = property.key.name
        const value = property.value as ValueNode
        properties.push({key, value} as WidgetCommands.Property)
      })

      commands.push(new WidgetCommands.Config(widget_id_arg.name, properties))
      return
    }

    if (proc.id.name == 'show_iolets') {
      commands.push(new IgnoredCommand('show_iolets'))
      return
    }

    if (proc.id.name == 'pdtk_text_editing') {
      commands.push(new IgnoredCommand('pdtk_text_editing'))
      return
    }

    if (proc.id.name == 'textselect') {
      commands.push(new IgnoredCommand('textselect'))
      return
    }

    if (proc.id.name == 'create_inlets') {
      const widget_id_arg = proc.arguments[0] as Identifier
      const widget_id = widget_id_arg.name

      // there are two forms:
      // ::pdwidget::create_inlets 0x7d95e0 {0.000000 } ;
      // ::pdwidget::create_inlets 0x7da030 0 ;
      const inlets_arg = proc.arguments[1]
      const iolet_types: IOLetType[] = []
      if (inlets_arg instanceof VectorNode) {
        inlets_arg.elements.forEach(i => {
          const inlet_type = parseInt((i as NumberNode).value)
          iolet_types.push(inlet_type)
        })
      } else {
        const inlet_type = parseInt((inlets_arg as NumberNode).value)
        iolet_types.push(inlet_type)
      }
      commands.push(new WidgetCommands.CreateIOLet(widget_id, IOLetScope.Input, iolet_types))
      return
    }

    if (proc.id.name == 'create_outlets') {
      const widget_id_arg = proc.arguments[0] as Identifier
      const widget_id = widget_id_arg.name

      // there are two forms:
      // ::pdwidget::create_outlets 0x7d95e0 {0.000000 } ;
      // ::pdwidget::create_outlets 0x7da030 0 ;
      const inlets_arg = proc.arguments[1]
      const iolet_types: IOLetType[] = []
      if (inlets_arg instanceof VectorNode) {
        inlets_arg.elements.forEach(i => {
          const inlet_type = parseInt((i as NumberNode).value)
          iolet_types.push(inlet_type)
        })
      } else {
        const inlet_type = parseInt((inlets_arg as NumberNode).value)
        iolet_types.push(inlet_type)
      }
      commands.push(new WidgetCommands.CreateIOLet(widget_id, IOLetScope.Output, iolet_types))
      return
    }

    if (proc.id.name == 'displace') {
      const widget_id_arg = proc.arguments[0] as Identifier
      const x_arg = proc.arguments[1] as NumberNode
      const y_arg = proc.arguments[2] as NumberNode
      const x = parseInt(x_arg.value)
      const y = parseInt(y_arg.value)
      commands.push(new WidgetCommands.Displace(widget_id_arg.name, x, y))
      return
    }

    if (proc.id.name == 'moveto') {
      const widget_id_arg = proc.arguments[0] as Identifier
      const canvas_id_arg = proc.arguments[0] as Identifier
      const x_arg = proc.arguments[2] as NumberNode
      const y_arg = proc.arguments[3] as NumberNode
      const x = parseInt(x_arg.value)
      const y = parseInt(y_arg.value)
      commands.push(new WidgetCommands.MoveTo(widget_id_arg.name, canvas_id_arg.name, x, y))
      return
    }

    if (proc.id.name == 'select') {
      const widget_id_arg = proc.arguments[0] as Identifier
      const is_selected_arg = proc.arguments[1] as NumberNode
      const is_selected = parseInt(is_selected_arg.value) == 1
      commands.push(new WidgetCommands.Select(widget_id_arg.name, is_selected))
      return
    }

    if (proc.id.name == 'activate') {
      const widget_id_arg = proc.arguments[0] as Identifier
      const is_activated_arg = proc.arguments[1] as NumberNode
      const is_activated = parseInt(is_activated_arg.value) == 1
      commands.push(new WidgetCommands.Activate(widget_id_arg.name, is_activated))
      return
    }

    // legacy style canvas command
    if (proc.id.name.startsWith('.x') && proc.id.name.endsWith('.c')) {
      if (proc.arguments.length >= 2) {
        const action = proc.arguments[0] as Identifier
        if(action.name == 'delete') {
          commands.push(new PdCommands.DeleteCanvas(clean_canvas_id(proc.id.name)))
          return
        }
      }
    }

    commands.push(new UnrecognizedCommand(proc.id.name))
  })
  return commands
}
