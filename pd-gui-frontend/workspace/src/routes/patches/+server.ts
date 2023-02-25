import * as fs from 'node:fs'

import type { PatchFile } from '$lib/stores/patches'
import { json } from '@sveltejs/kit'

export async function GET() {
  // console.log(process.env)
  const override_patch_directory = process.env.OVERRIDE_PATCH_DIRECTORY || "/patches"
  // console.log(override_patch_directory)
  let id = 1
  let patches: PatchFile[] = []
  const files = fs.readdirSync('/patches')
  fs.readdirSync('/patches').forEach(file => {
    file = `${override_patch_directory}/${file}`
    patches.push({id, file})
    id++
  })
  return json(patches)
}
