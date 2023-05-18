import * as fs from 'node:fs'

import type { PatchFile } from '$lib/stores/patches'
import { json } from '@sveltejs/kit'

export async function GET() {
  console.log(process.env.OVERRIDE_PATCH_DIRECTORY)
  console.log(process.env.ARE_WE_DOCKERIZED)
  const virtual_directory = process.env.OVERRIDE_PATCH_DIRECTORY || "/patches"
  const actual_directory = process.env.ARE_WE_DOCKERIZED || false ? "/patches" : virtual_directory
  let patches: PatchFile[] = []
  fs.readdirSync(actual_directory).forEach(file => {
    file = `${virtual_directory}/${file}`
    const id = patches.length + 1
    patches.push({id, file})
  })
  return json({directory: virtual_directory, patches})
}
