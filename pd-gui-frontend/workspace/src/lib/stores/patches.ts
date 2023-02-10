import { writable } from "svelte/store"

export type PatchFile = {
  id: number
  file: string
}

const dummy_patches = [
  {id: 1, file: '/patches/hello.pd'},
  {id: 6, file: '/patches/empty.pd'},
  {id: 7, file: '/patches/canvas.pd'},
  {id: 8, file: '/patches/subpatch.pd'},
]

export const available_patches = writable<PatchFile[]>(dummy_patches)