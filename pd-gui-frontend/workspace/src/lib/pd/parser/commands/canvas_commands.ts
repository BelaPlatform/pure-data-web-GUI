import { get } from 'svelte/store'

import { Command } from './command'
import type { Pd } from '../../pd'
import type * as G from '../../../utils/geometry'
import { app } from '$lib/stores/app'

export class ReflectTitle extends Command {
  constructor(public canvas_id: string,
      public directory: string,
      public title: string,
      public mode: string,
      public is_unsaved: boolean = false) {
    super()
  }

  override eval(pd: Pd) {
    const canvas = pd.canvas_with_id(this.canvas_id)
    if (!canvas) {
      return
    }

    let mode_text = " "
    if (this.mode.length != 0) {
      mode_text += this.mode.replace('\\[', '[')
      mode_text = mode_text.replace('\\]', ']') + " "
    }

    canvas.handle_set_title(`${this.title}${this.is_unsaved ? '*' : ''}${mode_text}- ${this.directory}`)

    pd.on_map_canvas_with_id(this.canvas_id)
  }
}

export class SetParents extends Command {
  constructor(public canvas_id: string) {
    super()
  }

  override eval(pd: Pd) { }
}

export class NewCanvas extends Command {
  constructor(public canvas_id: string, public size: G.Size, public origin: G.Point, public set_edit_mode_on: boolean) {
    super()
  }

  override eval(pd: Pd) { 
    pd.handle_new_canvas_with_id(this.canvas_id, this.size, this.origin, this.set_edit_mode_on)
  }
}

export class SaveAs extends Command {
  constructor(public canvas_id: string) {
    super()
  }

  override eval(pd: Pd) { 
    const canvas = pd.canvas_with_id(this.canvas_id)
    if (!canvas) {
      return
    }
    get(app).wm.on_show_save_as_dialog_for_canvas(canvas)
  }
}

export class GetScroll extends Command {
  constructor(public canvas_id: string) {
    super()
  }

  override eval(pd: Pd) { }
}

export class SetCursor extends Command {
  constructor(public canvas_id: string, public cursor: string) {
    super()
  }

  override eval(pd: Pd) {
    const canvas = pd.canvas_with_id(this.canvas_id)
    if (!canvas) {
      return
    }
    canvas.handle_set_cursor(this.cursor)
  }
}

export class SetZoom extends Command {
  constructor(public canvas_id: string, public value: number) {
    super()
  }

  override eval(pd: Pd) { }
}

export class PopUp extends Command {
  constructor(public canvas_id: string,
    public x: number,
    public y: number,
    public show_properties: boolean,
    public show_open: boolean) {
    super()
  }

  override eval(pd: Pd) {
    const canvas = pd.canvas_with_id(this.canvas_id)
    if (!canvas) {
      return
    }
    canvas.handle_popup(this.x, this.y, this.show_properties, this.show_open)
  }
}

export class SetEditMode extends Command {
  constructor(public canvas_id: string,
    public use_edit_mode: boolean) {
    super()
  }

  override eval(pd: Pd) {
    const canvas = pd.canvas_with_id(this.canvas_id)
    if (!canvas) {
      return
    }
    canvas.handle_set_editmode(this.use_edit_mode)
  }
}

export class Raise extends Command {
  constructor(public canvas_id: string) {
    super()
  }

  override eval(pd: Pd) {
    const canvas = pd.canvas_with_id(this.canvas_id)
    if (!canvas) {
      return
    }
    canvas.handle_raise()
  }
}

export class TextEditing extends Command {
  constructor(public canvas_id: string, public text_editing_is_on: boolean) {
    super()
  }

  override eval(pd: Pd) {
    const canvas = pd.canvas_with_id(this.canvas_id)
    if (!canvas) {
      return
    }
    canvas.handle_text_editing(this.text_editing_is_on)
  }
}
