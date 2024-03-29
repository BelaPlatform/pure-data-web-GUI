import { writable, get } from "svelte/store"

import type { App } from './app'
import * as G from '../utils/geometry'
import PatchView from '$lib/components/shell/PatchView.svelte'
import type { PdCanvas } from '../pd/pd_canvas'
import MessageDialog from '$lib/components/pd/dialogs/MessageDialog.svelte'
import FindDialog from '$lib/components/pd/dialogs/FindDialog.svelte'
import PreferencesDialog from '$lib/components/pd/dialogs/PreferencesDialog.svelte'
import AudioSettingsDialog from '$lib/components/pd/dialogs/AudioSettingsDialog.svelte'
import PdDialog from '$lib/components/pd/dialogs/PdDialog.svelte'
import AboutPdDialog from '$lib/components/pd/dialogs/AboutPdDialog.svelte'
import SaveAsDialog from '$lib/components/pd/dialogs/SaveAsDialog.svelte'
import SaveDialog from '$lib/components/pd/dialogs/SaveDialog.svelte'


export type DialogType = 'pd' | 'message' | 'find' | 'preferences' | 'audio-settings' | 'about'

function DefaultBox() { 
  return new G.Rect(new G.Point(24, 24), new G.Size(480, 360)) 
}

export class ViewKlass {
  constructor(public component: any, public props: any) {}
}

export class View {
  constructor(public frame: Frame, public klass: ViewKlass) {}
}

export class Frame {
  box = writable<G.Rect>(DefaultBox())
  restore_box = DefaultBox()
  title = writable<string>("Title")
  z_index = writable<number>(9999)
  hidden = writable<boolean>(false)
  is_active = writable<boolean>(false)
  is_resizable = writable<boolean>(true)
  is_maximized = writable<boolean>(false)
  is_hideable = writable<boolean>(true)
  dialogs: Frame[] = []
  parent: Frame|null = null
  view: View
  close_effect: Function|null = null

  constructor(public id: number, public klass: ViewKlass, box: G.Rect) {
    // console.log('Frame()', id, klass)
    this.box.set(box)
    this.view = new View(this, klass)
  }

  move_to(x: number, y: number) {
    this.box.update(box => {
      box.origin.x = x > 0 ? x : 0
      box.origin.y = y > 0 ? y : 0
      return box
    })
  }

  resize_by(x: number, y: number) {
    this.box.update(box => {
      box.size.width += x
      box.size.height += y
      return box
    })
  }

  hide() {
    this.hidden.update(_ => true)
  }

  unhide() {
    this.hidden.update(_ => false)
  }

  maximize(width: number, height: number) {
    this.box.update(box => {
      this.restore_box = box.clone()
      box.origin.x = 4
      box.origin.y = 36
      box.size.width = width - 8
      box.size.height = height - 48
      return box
    })
    this.is_maximized.update(_ => true)
    this.is_resizable.update(_ => false)
  }

  unmaximize() {
    this.box.update(_ => this.restore_box)
    this.is_maximized.update(_ => false)
    this.is_resizable.update(_ => true)
  }

  set_title(title: string) {
    this.title.update(_ => title)
  }

  set_size(size: G.Size) {
    this.box.update(box => {
      box.size = size
      return box
    })
  }

  set_is_resizable(is_resizable: boolean) {
    this.is_resizable.update(_ => is_resizable)
  }

  set_is_hideable(is_hideable: boolean) {
    this.is_hideable.update(_ => is_hideable)
  }

}

export class WindowManager {
  frames = writable<Frame[]>([])
  next_id = 1
  n_frames = 0
  active_frame: Frame | null = null
  singleton_dialogs: [DialogType, Frame][] = []
  desktop_size: G.Size = new G.Size(0, 0)
  target_canvas: PdCanvas|null = null

  constructor(public app: App) {}

  destroy_canvas_frames() {
    this.frames.update(fs => {
      const ws = fs.filter(f => f.klass.component != PatchView)
      return ws
    })
    this.active_frame = null
  }

  new_canvas_frame(canvas: PdCanvas) {
    // console.log(`new_canvas_frame ${canvas.id}`)

    // do we already have a frame for this canvas?
    let frame = this.frame_for_canvas(canvas)
    if (!frame) {
      const box = DefaultBox()
      box.origin.x = get(canvas.origin).x
      box.origin.y = get(canvas.origin).y
      if (box.origin.x == 0) {
        box.origin.x = this.next_id * 24
      }
      if (box.origin.y == 0) {
        box.origin.y = this.next_id * 24
      }

      frame = new Frame(this.next_id++, new ViewKlass(PatchView, {canvas}), box)
      this.frames.update(ws => {
        ws.push(frame!)
        return ws
      })
      this.n_frames++
    }

    this.stack_top(frame)
  }

  new_dialog_frame(component: any) {
    const box = DefaultBox()
    box.origin.x += this.next_id * 24
    box.origin.y += this.next_id * 24

    const frame = new Frame(this.next_id++, new ViewKlass(component, {}), box)
    this.frames.update(fs => {
      fs.push(frame)
      return fs
    })
    this.n_frames++
    this.stack_top(frame)
    return frame
  }

  on_show_singleton_dialog(dialog: DialogType) {
    let dialog_frame = this.singleton_dialogs.find(dlg => dlg[0] == dialog)
    if (dialog_frame === undefined) {
      let component: any = null
      switch(dialog) {
        case 'about':
          component = AboutPdDialog
          break
        case 'audio-settings':
          component = AudioSettingsDialog
          break
        case 'find':
          component = FindDialog
          break
        case 'message':
          component = MessageDialog
          break
        case 'pd':
          component = PdDialog
          break
        case 'preferences':
          component = PreferencesDialog
          break
      }
      dialog_frame = [dialog, this.new_dialog_frame(component)]
      this.singleton_dialogs.push(dialog_frame)
    }
    this.stack_top(dialog_frame[1])
  }

  on_show_save_dialog_for_canvas(canvas: PdCanvas) {
    const component = SaveDialog
    const frame = this.new_dialog_frame(component)
    frame.klass.props.canvas = canvas
    this.stack_top(frame)
  }

  on_show_save_as_dialog_for_canvas(canvas: PdCanvas) {
    const component = SaveAsDialog
    const frame = this.new_dialog_frame(component)
    frame.klass.props.canvas = canvas
    this.stack_top(frame)
  }

  frame_for_canvas(canvas: PdCanvas) {
    const frames_ = get(this.frames)
    return frames_.find(f => {
      if (f.klass.component == PatchView) {
        if (f.klass.props.canvas !== undefined) {
          return f.klass.props.canvas.id === canvas.id
        }
      } else {
        return false
      }
    })
  }

  close_frame(frame: Frame) {
    // is it one of the singleton dialogs?
    if (this.singleton_dialogs.find(d => d[1] == frame)) {
      frame.hidden.update(_ => true)
      return
    }

    // does it have a side effect?
    if (frame.close_effect) {
      frame.close_effect()
      return
    }

    this.frames.update(fs => {
      return fs.filter(f => {
        // console.log(`${f.id} vs ${frame.id}`)
        return f.id != frame.id
      })
    })

    // is there another frame we could activate?
    const frame_ = this.last_frame()
    if (frame_) {
      this.stack_top(frame_)
    }
  }

  private last_frame() {
    const frames_ = get(this.frames)
    if (frames_.length == 0) {
      return null
    }
    return frames_[frames_.length - 1]
  }

  close_active_frame() {
    if (this.active_frame) {
      this.close_frame(this.active_frame)
    }
  }

  stack_top(frame: Frame) {
    let z_index = 9999
    get(this.frames).forEach(f => {
      const is_new_top = frame.id == f.id
      f.z_index.update(_ => z_index + (is_new_top ? 9999 : 0))
      f.is_active.update(_ => is_new_top)
    })
    frame.hidden.update(_ => false)
    this.active_frame = frame

    if (frame.klass.props.canvas) {
      get(this.app.pd)!.set_active_canvas(frame.klass.props.canvas)
    }
  }

  on_keydown(event: KeyboardEvent) {
    // console.log(event)
    const maybe_pd = get(this.app.pd)
    if (!maybe_pd) { return }

    const pd = maybe_pd!


    // is it a shortcut?
    if (event.key == '#' && event.ctrlKey) {
      event.preventDefault()
      this.app.on_toggle_debug()
      return
    }

    if (event.key == '/' && event.ctrlKey) {
      event.preventDefault()
      pd.on_set_dsp_on()
      return
    }

    if (event.key == '.' && event.ctrlKey) {
      event.preventDefault()
      pd.on_set_dsp_off()
      return
    }

    if (event.code == 'KeyR' && event.altKey) {
      event.preventDefault()
      pd.send_refresh_gui()
      return
    }

    if (event.code == 'KeyN' && event.altKey && !event.shiftKey) {
      this.app.on_new_patch()
      event.preventDefault()
      return
    }

    if (event.code == 'KeyW' && event.altKey) {
      this.close_active_frame()
      event.preventDefault()
      return
    }

    // do we have an open canvas?
    const canvas = get(pd.active_canvas)
    if (canvas) {
      if (event.key == 's' && event.ctrlKey) {
        event.preventDefault()
        canvas.on_save()
        return
      }

      if (event.key == 'c' && event.ctrlKey) {
        event.preventDefault()
        canvas.on_copy()
        return
      }
  
      if (event.key == 'v' && event.ctrlKey) {
        event.preventDefault()
        canvas.on_paste()
        return
      }
  
      if (event.key == 'x' && event.ctrlKey) {
        event.preventDefault()
        canvas.on_cut()
        return
      }
    }
  }

  private find_svg_element(event: MouseEvent) : SVGSVGElement|null {
    let element: Element | null = event.target as Element
    while (element) {
      if (element instanceof SVGSVGElement) {
        return element as SVGSVGElement
      }
      element = element.parentElement
    }
    return null
  }

  private canvas_from_event(event: MouseEvent) {
    const element = this.find_svg_element(event)
    if (element) {
      if (element.hasAttribute('data-canvas-id')) {
        const canvas_id = element.getAttribute('data-canvas-id')!
        const pd = get(this.app.pd)
        return pd!.canvas_with_id(canvas_id) || null
      }
    }
    return null
  }

  private global_to_canvas_local(event: MouseEvent, canvas: PdCanvas) {
    const origin = get(canvas.origin)
    const scroll_pos = get(canvas.scroll_pos)
    const x = event.clientX - origin.x + scroll_pos.x
    const y = event.clientY - origin.y + scroll_pos.y
    return {x, y}
  }

  on_mousemove(event: MouseEvent) {
    const canvas = this.target_canvas != null ? this.target_canvas : this.canvas_from_event(event)
    if (canvas) {
      const {x, y} = this.global_to_canvas_local(event, canvas)
      const modifiers = (event.ctrlKey ? 2 : 0) + (event.altKey ? 4 : 0)
      canvas.send_motion(x, y, modifiers)
      return
    }
  }

  on_mousedown(event: MouseEvent) {
    const canvas = this.canvas_from_event(event)
    if (canvas) {
      this.target_canvas = canvas
      const {x, y} = this.global_to_canvas_local(event, canvas)
      const button = 1
      const modifiers = (event.ctrlKey ? 2 : 0) + (event.altKey ? 4 : 0)
      this.target_canvas.send_mouse_down(x, y, button, modifiers)
      return
    }
  }

  on_mouseup(event: MouseEvent) {
    if (this.target_canvas) {
      const {x, y} = this.global_to_canvas_local(event, this.target_canvas)
      this.target_canvas.send_mouse_up(x, y, event.button)
      this.target_canvas = null
      return
    }
  }
}
