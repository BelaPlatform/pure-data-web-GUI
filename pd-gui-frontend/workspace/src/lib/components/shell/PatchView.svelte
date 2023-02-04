<script lang="ts">
  import { onMount } from 'svelte'

  import CanvasComponent from '../pd/Canvas.svelte'
  import type { PdCanvas } from '$lib/pd/pd_canvas'
  import type { Fenster } from '$lib/stores/wm'

  export let canvas:PdCanvas
  export let fenster: Fenster

  $: is_active = fenster.is_active

  onMount(() => {
    canvas.title.subscribe(t => {
      console.log(t)
      fenster.title.update(_ => t)
    })
  })
</script>

<div>
  <CanvasComponent canvas={canvas} is_active={$is_active} />
</div>