<script lang="ts">
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'

  import CanvasComponent from '../pd/Canvas.svelte'
  import type { PdCanvas } from '$lib/pd/pd_canvas'
  import type { Fenster } from '$lib/stores/wm'

  export let canvas:PdCanvas
  export let fenster: Fenster

  $: is_active = fenster.is_active

  onMount(() => {
    canvas.title.subscribe(t => {
      fenster.title.update(_ => t)
    })

    const size = get(canvas.size)
    fenster.set_size(size)
    fenster.box.subscribe(box => {
      canvas.on_set_size(box.size)
    })
  })
</script>

<div>
  <CanvasComponent canvas={canvas} is_active={$is_active} />
</div>