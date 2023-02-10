import { writable } from "svelte/store"

export type PatchFile = {
  id: number
  file: string
}

export async function enumerate_patches() {
  const response = await fetch('/patches', {
    method: 'GET'
  })
  const patches = await response.json()
  console.log(patches)
  available_patches.update(_ => patches)
}

export const available_patches = writable<PatchFile[]>([])