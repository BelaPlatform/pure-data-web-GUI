import { get } from 'svelte/store'

import { available_patches } from './patches'
import { wm } from './wm'

export class MenuItem {
  constructor(public title: string,
    public action: Function = () => {},
    public children: MenuItem[] = []) {

    }
}

function on_new_window() {
  get(wm).new_window()
}

function on_close_window() {
  get(wm).close_active_window()
}

function build_file_menu() : MenuItem[] {
  const pre = [
    new MenuItem('New', on_new_window),
    new MenuItem('Open'),
    new MenuItem('Save'),
    new MenuItem('SaveAs'),
    new MenuItem('Message'),
    new MenuItem('Preferences')
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
    recent.push(new MenuItem(`${item.id}. ${filename}`))
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
  new MenuItem('SelectAll')
]

let put_menu: MenuItem[] = [
  new MenuItem('Object'),
  new MenuItem('Message'),
  new MenuItem('Number'),
  new MenuItem('...')
]

let find_menu: MenuItem[] = [
  new MenuItem('Find'),
  new MenuItem('Find Again'),
  new MenuItem('Find Last Error')
]

let media_menu: MenuItem[] = [
  new MenuItem('DSP On'),
  new MenuItem('DSP Off'),
  new MenuItem('Test Audio and Midi...'),
  new MenuItem('...')
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
  new MenuItem('Window', () => {}),
  new MenuItem('Help', () => {}, help_menu),
]
