<script lang="ts">
  import type { PdWidget } from '$lib/pd/pd_widget'
  import NodeBase from './NodeBase.svelte'

  export let widget:PdWidget
  $: is_activated = widget.is_activated
  $: fcolor = widget.fcolor
  $: box = widget.box
  $: size = $box.size.width
</script>

<NodeBase {widget} />
<g style:--fcolor={$fcolor}>
  <line x1={2} x2={size - 2} y1={2} y2={size - 2} class:is_activated={$is_activated} />
  <line x1={2} x2={size - 2} y1={size - 2} y2={2} class:is_activated={$is_activated} />
</g>

<style lang="scss">
  line {
    stroke: #fff;
    stroke-width: 0.5;
    &.is_activated {
      stroke: var(--fcolor);
    }
  }
</style>