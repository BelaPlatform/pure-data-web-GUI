import { Command } from './command'
import type { Pd } from '../../pd'

export class ReflectTitle extends Command {
  constructor(public canvas_id: string, public directory: string, public title: string) {
    super()
  }

  override eval(pd: Pd) {
    const canvas = pd.canvas_with_id(this.canvas_id)
    if (!canvas) {
      return
    }
    canvas.title = this.title

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
  constructor(public canvas_id: string) {
    super()
  }

  override eval(pd: Pd) { 
    pd.handle_new_canvas_with_id(this.canvas_id)
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
