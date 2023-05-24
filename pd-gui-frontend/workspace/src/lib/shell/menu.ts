import { get } from 'svelte/store'

import { app } from '../stores/app'
import { available_patches, type PatchFile } from '../stores/patches'
import type { PdCanvas, NodeType } from '../pd/pd_canvas'
import type { DialogType } from './wm'

export class MenuItem {
  constructor(public title: string,
    public action: Function = () => {},
    public children: MenuItem[] = [],
    public shortcut: string = "") {
    }
}

function active_canvas(): PdCanvas|null {
  const app_ = get(app)
  const canvas_ = get(app_.pd)?.active_canvas
  if (canvas_) {
    const canvas = get(canvas_)
    return canvas
  }
  return null
}

function on_new_patch() {
  get(app).on_new_patch()
}

function on_open_patch(patch: PatchFile) {
  get(app).on_open_patch(patch)
}

function on_save_patch() {
  active_canvas()?.on_save()
}

function on_save_patch_as() {
  const canvas = active_canvas()
  if (canvas) {
    get(app).wm.on_show_save_as_dialog_for_canvas(canvas)
  }
}

function on_edit_cut() {
  active_canvas()?.on_cut()
}

function on_edit_copy() {
  active_canvas()?.on_copy()
}

function on_edit_paste() {
  active_canvas()?.on_paste()
}

function on_edit_toggle_edit_mode() {
  active_canvas()?.on_paste()
}

function on_edit_connect_selection() {
  active_canvas()?.on_connect_selection()
}

function on_edit_select_all() {
  active_canvas()?.on_select_all()
}

function on_edit_duplicate() {
  active_canvas()?.on_duplicate()
}

function on_close_frame() {
  get(app).wm.close_active_frame()
}

function on_show_message_dialog() {
  get(app).wm.on_show_singleton_dialog('message')
}

function on_show_find_dialog() {
  get(app).wm.on_show_singleton_dialog('find')
}

function on_show_preferences_dialog() {
  get(app).wm.on_show_singleton_dialog('preferences')
}

function on_show_audio_settings_dialog() {
  get(app).wm.on_show_singleton_dialog('audio-settings')
}

function on_show_pd_dialog() {
  get(app).wm.on_show_singleton_dialog('pd')
}

function on_show_about_pd_dialog() {
  get(app).wm.on_show_singleton_dialog('about')
}

function on_show_manual() {
  window.open('https://puredata.info/docs/manuals/pd/')
}

function on_print() {
  window.print()
}

function on_dsp_on() {
  const app_ = get(app)
  get(app_.pd)?.on_set_dsp_on()
}

function on_dsp_off() {
  const app_ = get(app)
  get(app_.pd)?.on_set_dsp_off()
}

function build_file_menu() : MenuItem[] {
  const pre = [
    new MenuItem('New', on_new_patch, [], 'Alt+N'),
    new MenuItem('Open'),
    new MenuItem('-'),
    new MenuItem('Save', on_save_patch, [], 'Ctrl+S'),
    new MenuItem('Save As...', on_save_patch_as, [], 'Ctrl+Shift+S'),
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

function on_put(what: NodeType) {
  const canvas = active_canvas()
  if (!canvas) { return }
  canvas.on_put(what)
}

export async function make_menu() {
  let file_menu: MenuItem[] = build_file_menu()

  let edit_menu: MenuItem[] = [
  /*   new MenuItem('Undo'),
    new MenuItem('Redo'), */
    new MenuItem('Cut', on_edit_cut, [], 'Ctrl+X'),
    new MenuItem('Copy', on_edit_copy, [], 'Ctrl+C'),
    new MenuItem('Paste', on_edit_paste, [], 'Ctrl+V'),
    new MenuItem('Duplicate', on_edit_duplicate, [], 'Ctrl+D'),
    new MenuItem('SelectAll', on_edit_select_all, [], 'Ctrl+A'),
    new MenuItem('-'),
    new MenuItem('Connect Selection', on_edit_connect_selection, [], 'Ctrl+K'),
    new MenuItem('-'),
    new MenuItem('Edit Mode', on_edit_toggle_edit_mode, [], 'Ctrl+E'),
  ]

  let put_menu: MenuItem[] = [
    new MenuItem('Object', () => on_put('obj'), [], 'Ctrl+1'),
    new MenuItem('Message', () => on_put('msg'), [], 'Ctrl+2'),
    new MenuItem('Number', () => on_put('floatatom'), [], 'Ctrl+3'),
    new MenuItem('Symbol', () => on_put('symbolatom'), [], 'Ctrl+4'),
    new MenuItem('Comment', () => on_put('text'), [], 'Ctrl+5'),
    new MenuItem('-'),
    new MenuItem('Bang', () => on_put('bng'), [],'Alt+Shift+B'),
    new MenuItem('Toggle', () => on_put('toggle'), [],'Alt+Shift+T'),
    new MenuItem('Vslider', () => on_put('vslider'), [],'Alt+Shift+V'),
    new MenuItem('Hslider', () => on_put('hslider'), [],'Alt+Shift+J'),
  ]

  let find_menu: MenuItem[] = [
    new MenuItem('Find', on_show_find_dialog),
    /* new MenuItem('Find Again'),
    new MenuItem('Find Last Error') */
  ]

  let media_menu: MenuItem[] = [
    new MenuItem('DSP On', on_dsp_on, [], 'Ctrl+/'),
    new MenuItem('DSP Off', on_dsp_off, [], 'Ctrl+.'),
    // new MenuItem('Test Audio and Midi...'),
    new MenuItem('-'),
    new MenuItem('Audio Settings...', on_show_audio_settings_dialog),
    // new MenuItem('...')
  ]

  let window_menu: MenuItem[] = [
    new MenuItem('Pd Window', on_show_pd_dialog),
    // new MenuItem('Parent Window'),
  ]

  let help_menu: MenuItem[] = [
    new MenuItem('About Pd', on_show_about_pd_dialog),
    new MenuItem('HTML Manual...', on_show_manual),
    /* new MenuItem('Browser...'),
    new MenuItem('List of Objects...'),
    new MenuItem('...') */
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