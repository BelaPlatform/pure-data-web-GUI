import { get } from 'svelte/store'

import { Command } from './command'
import { app } from '$lib/stores/app'

export class UpdateWindowMenu extends Command {
  constructor(public message: string) {
    super()
  }

  override eval(_:any) {
    get(app).handle_update_window_menu()
  }
}
