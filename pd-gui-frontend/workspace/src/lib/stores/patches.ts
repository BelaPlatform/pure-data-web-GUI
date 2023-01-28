import { writable } from "svelte/store"

export type PatchFile = {
  id: number
  file: string
}

const dummy_patches = [
  {id: 1, file: '/home/hase/Documents/Pd/hello.pd'},
  {id: 2, file: '/home/hase/Documents/Pd/metro_hello.pd'},
  {id: 3, file: '/home/hase/Documents/Pd/empty.pd'},
  {id: 4, file: '/home/hase/Documents/Pd/inlets-outlets.pd'},
  {id: 5, file: '/home/hase/Documents/Pd/metro_bang.pd'},
]

export const available_patches = writable<PatchFile[]>(dummy_patches)