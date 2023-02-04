import { get } from 'svelte/store'

import { app } from './app'
import { available_patches, type PatchFile } from './patches'
import MessageDialog from '$lib/components/pd/dialogs/MessageDialog.svelte'
import FindDialog from '$lib/components/pd/dialogs/FindDialog.svelte'
import PreferencesDialog from '$lib/components/pd/dialogs/PreferencesDialog.svelte'
import AudioSettingsDialog from '$lib/components/pd/dialogs/AudioSettingsDialog.svelte'
import PdDialog from '$lib/components/pd/dialogs/PdDialog.svelte'

export class MenuItem {
  constructor(public title: string,
    public action: Function = () => {},
    public children: MenuItem[] = []) {

    }
}

function on_new_patch() {
  get(app).on_new_patch()
}

function on_open_patch(patch: PatchFile) {
  get(app).on_open_patch(patch)
}

function on_close_window() {
  get(app).wm.close_active_window()
}

function on_show_message_dialog() {
  get(app).wm.new_dialog_window(MessageDialog)
}

function on_show_find_dialog() {
  get(app).wm.new_dialog_window(FindDialog)
}

function on_show_preferences_dialog() {
  get(app).wm.new_dialog_window(PreferencesDialog)
}

function on_show_audio_settings_dialog() {
  get(app).wm.new_dialog_window(AudioSettingsDialog)
}

function on_show_pd_dialog() {
  get(app).wm.new_dialog_window(PdDialog)
}


function build_file_menu() : MenuItem[] {
  const pre = [
    new MenuItem('New', on_new_patch),
    new MenuItem('Open'),
    new MenuItem('Save'),
    new MenuItem('SaveAs'),
    new MenuItem('Message', on_show_message_dialog),
    new MenuItem('Preferences', on_show_preferences_dialog)
  ]

  const post = [
    new MenuItem('Print'),
    new MenuItem('Close', on_close_window),
    new MenuItem('Quit')
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

let file_menu: MenuItem[] = build_file_menu()

let edit_menu: MenuItem[] = [
  new MenuItem('Undo'),
  new MenuItem('Redo'),
  new MenuItem('Cut'),
  new MenuItem('Copy'),
  new MenuItem('Paste'),
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
  new MenuItem('About Pd'),
  new MenuItem('HTML Manual...'),
  new MenuItem('Browser...'),
  new MenuItem('List of Objects...'),
  new MenuItem('...')
]

export const menu: MenuItem[] = [
  new MenuItem('File', () => {}, file_menu),
  new MenuItem('Edit', () => {}, edit_menu),
  new MenuItem('Put', () => {}, put_menu),
  new MenuItem('Find', () => {}, find_menu),
  new MenuItem('Media', () => {}, media_menu),
  new MenuItem('Window', () => {}, window_menu),
  new MenuItem('Help', () => {}, help_menu),
]
