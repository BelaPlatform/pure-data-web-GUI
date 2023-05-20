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
    this.box.set(box)
    this.view = new View(this, klass)
  }

  move_to(x: number, y: number) {
    this.box.update(box => {
      box.origin.x = x
      box.origin.y = y
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

  constructor(public app: App) {}

  use_app(app: App) {
    this.app = app
  }

  new_canvas_frame(canvas: PdCanvas) {
    const box = DefaultBox()
    box.origin.x = get(canvas.origin).x
    box.origin.y = get(canvas.origin).y
    if (box.origin.x == 0) {
      box.origin.x = this.next_id * 24
    }
    if (box.origin.y == 0) {
      box.origin.y = this.next_id * 24
    }

    const w = new Frame(this.next_id++, new ViewKlass(PatchView, {canvas}), box)
    this.frames.update(ws => {
      ws.push(w)
      return ws
    })
    this.n_frames++
    this.stack_top(w)
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
          return f.klass.props.canvas === canvas
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
      /* const cancel_close = frame.close_effect()
      if (cancel_close) {
        return
      } */
      frame.close_effect()
      return
    }

    this.frames.update(fs => {
      return fs.filter(f => f.id != frame.id)
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
      this.app.pd.set_active_canvas(frame.klass.props.canvas)
    }
  }

  on_keydown(event: KeyboardEvent) {
    // console.log(event)
    // is it a shortcut?
    if (event.key == '#' && event.ctrlKey) {
      event.preventDefault()
      this.app.on_toggle_debug()
      return
    }

    if (event.key == 'r' && event.altKey) {
      event.preventDefault()
      this.app.pd.send_refresh_gui()
      return
    }

    if (event.key == 'n' && event.altKey) {
      this.app.on_new_patch()
      event.preventDefault()
      return
    }

    if (event.key == 'w' && event.altKey) {
      this.close_active_frame()
      event.preventDefault()
      return
    }

    // do we have an open canvas?
    const canvas = get(this.app.pd.active_canvas)
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
}
