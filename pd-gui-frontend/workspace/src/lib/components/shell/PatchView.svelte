<script lang="ts">
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'

  import { app } from '$lib/stores/app'
  import CanvasComponent from '../pd/Canvas.svelte'
  import type { PdCanvas } from '$lib/pd/pd_canvas'
  import type { Frame } from '$lib/shell/wm'
  import * as Geometry from '$lib/utils/geometry'

  export let canvas: PdCanvas
  export let frame: Frame

  $: is_active = frame.is_active
  $: pd = $app.pd

  onMount(() => {
    canvas.title.subscribe(t => {
      if (t.startsWith('PDUNTITLED') && !t.endsWith('.pd')) {
        t = t.replace('PDUNTITLED', 'Untitled')
      }
      frame.title.update(_ => t)
    })

    const size = get(canvas.size)
    // add some wiggle room for the scrollbars
    frame.set_size(new Geometry.Size(size.width + 12, size.height + 12))
    frame.box.subscribe(box => {
      canvas.on_set_size(new Geometry.Size(box.size.width - 12, box.size.height - 12))
      canvas.origin.update(_ => {
        return new Geometry.Point(box.origin.x, box.origin.y + 24)
      })
    })
    frame.close_effect = () => {
      $pd!.on_close(canvas)
    }
  })
</script>

<CanvasComponent canvas={canvas} is_active={$is_active} />
