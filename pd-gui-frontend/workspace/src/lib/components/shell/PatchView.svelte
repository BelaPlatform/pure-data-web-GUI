<script lang="ts">
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'

  import CanvasComponent from '../pd/Canvas.svelte'
  import type { PdCanvas } from '$lib/pd/pd_canvas'
  import type { Frame } from '$lib/stores/wm'

  export let canvas: PdCanvas
  export let frame: Frame

  $: is_active = frame.is_active

  onMount(() => {
    canvas.title.subscribe(t => {
      frame.title.update(_ => t)
    })

    const size = get(canvas.size)
    frame.set_size(size)
    frame.box.subscribe(box => {
      canvas.on_set_size(box.size)
    })
  })
</script>

<div>
  <CanvasComponent canvas={canvas} is_active={$is_active} />
</div>