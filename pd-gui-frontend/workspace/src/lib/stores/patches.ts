import { writable } from "svelte/store"

export type PatchFile = {
  id: number
  file: string
}

export async function enumerate_patches() {
  const response = await fetch('/patches', {
    method: 'GET'
  })
  const {directory, patches} = await response.json()
  available_patches.update(_ => patches)
  patch_directory.update(_ => directory)
}

export const available_patches = writable<PatchFile[]>([])
export const patch_directory = writable<string>('')