<script lang="ts">
  import type { PdWidget } from '$lib/pd/pd_widget'
  import NodeBase from './NodeBase.svelte'

  export let widget:PdWidget
  $: is_activated = widget.is_activated
  $: box = widget.box
  $: bcolor = widget.bcolor
  $: fcolor = widget.fcolor
</script>

<NodeBase {widget} />
<circle r={$box.size.width / 2 - 2} cx={$box.size.width / 2 - 0.5} cy={$box.size.width / 2 - 0.5} 
  class:is_activated={$is_activated} 
  style:--bcolor={$bcolor} 
  style:--fcolor={$fcolor} />

<style lang="scss">
  circle {
    stroke: #000;
    fill: var(--bcolor);
    &.is_activated {
      fill: var(--fcolor);
    }
  }
</style>