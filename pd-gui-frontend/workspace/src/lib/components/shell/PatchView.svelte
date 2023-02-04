<script lang="ts">
  import { onMount } from 'svelte'

  import CanvasComponent from '../pd/Canvas.svelte';
  import type { PdCanvas } from '$lib/pd/pd_canvas'

  export let canvas:PdCanvas

  onMount(() => {
    console.log('PatchView')
    console.log(canvas)
  })
</script>

<div>
  {canvas.title}
  <CanvasComponent canvas={canvas} />
</div>