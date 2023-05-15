import * as fs from 'node:fs'

import type { PatchFile } from '$lib/stores/patches'
import { json } from '@sveltejs/kit'

export async function GET() {
  const directory = process.env.OVERRIDE_PATCH_DIRECTORY || "/patches"
  console.log(directory)
  let patches: PatchFile[] = []
  fs.readdirSync(directory).forEach(file => {
    file = `${directory}/${file}`
    const id = patches.length + 1
    patches.push({id, file})
  })
  return json({directory, patches})
}
