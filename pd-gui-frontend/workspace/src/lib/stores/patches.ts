import { writable } from "svelte/store"

export type PatchFile = {
  id: number
  file: string
}

export async function enumerate_patches() {
  const dir = process.env.OVERRIDE_PATCH_DIRECTORY || "/patches"
  const response = await fetch(dir, {
    method: 'GET'
  })
  const {directory, patches} = await response.json()
  available_patches.update(_ => patches)
  patch_directory.update(_ => directory)
}

export const available_patches = writable<PatchFile[]>([])
export const patch_directory = writable<string>('')