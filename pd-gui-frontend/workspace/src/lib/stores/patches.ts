import { writable } from "svelte/store"

export type PatchFile = {
  id: number
  file: string
}

const dummy_patches = [
  {id: 1, file: '/home/hase/Documents/Pd/hello.pd'},
  {id: 2, file: '/home/hase/Documents/Pd/send.pd'},
  {id: 3, file: '/home/hase/Documents/Pd/slider.pd'},
  {id: 4, file: '/home/hase/Documents/Pd/radio.pd'},
  {id: 5, file: '/home/hase/Documents/Pd/vumeter.pd'},
  {id: 6, file: '/home/hase/Documents/Pd/empty.pd'},
  {id: 7, file: '/home/hase/Documents/Pd/canvas.pd'},
]

export const available_patches = writable<PatchFile[]>(dummy_patches)