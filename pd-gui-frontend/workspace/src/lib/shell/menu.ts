import { get } from 'svelte/store'

import { app } from '../stores/app'
import { available_patches, type PatchFile } from '../stores/patches'
import MessageDialog from '$lib/components/pd/dialogs/MessageDialog.svelte'
import FindDialog from '$lib/components/pd/dialogs/FindDialog.svelte'
import PreferencesDialog from '$lib/components/pd/dialogs/PreferencesDialog.svelte'
import AudioSettingsDialog from '$lib/components/pd/dialogs/AudioSettingsDialog.svelte'
import PdDialog from '$lib/components/pd/dialogs/PdDialog.svelte'
import AboutPdDialog from '$lib/components/pd/dialogs/AboutPdDialog.svelte'

export class MenuItem {
  constructor(public title: string,
    public action: Function = () => {},
    public children: MenuItem[] = [],
    public shortcut: string = "") {
    }
}

function on_new_patch() {
  get(app).on_new_patch()
}

function on_open_patch(patch: PatchFile) {
  get(app).on_open_patch(patch)
}

function on_save_patch() {
  const app_ = get(app)
  const canvas = get(app_.pd.active_canvas)
  if (canvas) {
    canvas.on_save()
  }
}

function on_edit_cut() {
  const app_ = get(app)
  const canvas = get(app_.pd.active_canvas)
  if (canvas) {
    canvas.on_cut()
  }
}

function on_edit_copy() {
  const app_ = get(app)
  const canvas = get(app_.pd.active_canvas)
  if (canvas) {
    canvas.on_copy()
  }
}

function on_edit_paste() {
  const app_ = get(app)
  const canvas = get(app_.pd.active_canvas)
  if (canvas) {
    canvas.on_paste()
  }
}

function on_close_frame() {
  get(app).wm.close_active_frame()
}

function on_show_message_dialog() {
  get(app).wm.new_dialog_frame(MessageDialog)
}

function on_show_find_dialog() {
  get(app).wm.new_dialog_frame(FindDialog)
}

function on_show_preferences_dialog() {
  get(app).wm.new_dialog_frame(PreferencesDialog)
}

function on_show_audio_settings_dialog() {
  get(app).wm.new_dialog_frame(AudioSettingsDialog)
}

function on_show_pd_dialog() {
  get(app).wm.new_dialog_frame(PdDialog)
}

function on_show_about_pd_dialog() {
  get(app).wm.new_dialog_frame(AboutPdDialog)
}

function on_print() {
  window.print()
}

function build_file_menu() : MenuItem[] {
  console.log('build_file_menu()')
  const pre = [
    new MenuItem('New', on_new_patch, [], 'Alt+N'),
    new MenuItem('Open'),
    new MenuItem('-'),
    new MenuItem('Save', on_save_patch, [], 'Ctrl+S'),
    new MenuItem('SaveAs'),
    new MenuItem('-'),
    new MenuItem('Message', on_show_message_dialog),
    new MenuItem('Preferences', on_show_preferences_dialog),
    new MenuItem('Print', on_print),
    new MenuItem('-'),
  ]

  const post = [
    new MenuItem('-'),
    new MenuItem('Close', on_close_frame, [], 'Alt+W')
    /* new MenuItem('Quit') */
  ]

  const recent: MenuItem[] = []
  get(available_patches).forEach(item => {
    const path_components = item.file.split('/')
    const filename = path_components[path_components.length - 1]
    const action = () => {
      on_open_patch(item)
    }
    recent.push(new MenuItem(`${item.id}. ${filename}`, action))
  })

  return pre.concat(recent).concat(post)
}


export async function make_menu() {
  let file_menu: MenuItem[] = build_file_menu()

  let edit_menu: MenuItem[] = [
  /*   new MenuItem('Undo'),
    new MenuItem('Redo'), */
    new MenuItem('Cut', on_edit_cut, [], 'Ctrl+X'),
    new MenuItem('Copy', on_edit_copy, [], 'Ctrl+C'),
    new MenuItem('Paste', on_edit_paste, [], 'Ctrl+V'),
    new MenuItem('Duplicate'),
    new MenuItem('SelectAll'),
  ]

  let put_menu: MenuItem[] = [
    new MenuItem('Object'),
    new MenuItem('Message'),
    new MenuItem('Number'),
    new MenuItem('...')
  ]

  let find_menu: MenuItem[] = [
    new MenuItem('Find', on_show_find_dialog),
    new MenuItem('Find Again'),
    new MenuItem('Find Last Error')
  ]

  let media_menu: MenuItem[] = [
    new MenuItem('DSP On'),
    new MenuItem('DSP Off'),
    new MenuItem('Test Audio and Midi...'),
    new MenuItem('Audio Settings...', on_show_audio_settings_dialog),
    new MenuItem('...')
  ]

  let window_menu: MenuItem[] = [
    new MenuItem('Pd Window', on_show_pd_dialog),
    new MenuItem('Parent Window'),
  ]

  let help_menu: MenuItem[] = [
    new MenuItem('About Pd', on_show_about_pd_dialog),
    new MenuItem('HTML Manual...'),
    new MenuItem('Browser...'),
    new MenuItem('List of Objects...'),
    new MenuItem('...')
  ]

  const menu: MenuItem[] = [
    new MenuItem('File', () => {}, file_menu),
    new MenuItem('Edit', () => {}, edit_menu),
    new MenuItem('Put', () => {}, put_menu),
    new MenuItem('Find', () => {}, find_menu),
    new MenuItem('Media', () => {}, media_menu),
    new MenuItem('Window', () => {}, window_menu),
    new MenuItem('Help', () => {}, help_menu),
  ]

  return menu
}