<script lang="ts">
  import type { PdWidget } from '$lib/pd/pd_widget'
  import NodeBase from './NodeBase.svelte'

  export let widget: PdWidget
  $: r = widget.activation_rect
</script>

<NodeBase {widget} />

<rect x={$r.origin.x} y={$r.origin.y} width={$r.size.width} height={$r.size.height} />


<style lang="scss">
  rect {
    fill: #000;
  }
</style>