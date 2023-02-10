import * as fs from 'node:fs'

import type { PatchFile } from '$lib/stores/patches'
import { json } from '@sveltejs/kit'

export async function GET() {
  let id = 1
  let patches: PatchFile[] = []
  const files = fs.readdirSync('/patches')
  fs.readdirSync('/patches').forEach(file => {
    file = `/patches/${file}`
    patches.push({id, file})
    id++
  })
  return json(patches)
}
