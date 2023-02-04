<script lang="ts">
  import CanvasComponent from '../pd/Canvas.svelte'
  import type { PdCanvas } from '$lib/pd/pd_canvas'
  import type { Fenster } from '$lib/stores/wm'

  export let canvas:PdCanvas
  export let fenster: Fenster

  $: is_active = fenster.is_active
</script>

<div>
  <CanvasComponent canvas={canvas} is_active={$is_active} />
</div>