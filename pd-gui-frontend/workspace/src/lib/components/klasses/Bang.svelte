<script lang="ts">
  import type { PdWidget } from '$lib/pd/pd_widget'
  import NodeBase from './NodeBase.svelte'

  export let widget:PdWidget
  $: is_activated = widget.is_activated
  $: box = widget.box
</script>

<NodeBase {widget} />
<circle r={$box.size.width / 2 - 2} cx={$box.size.width / 2 - 0.5} cy={$box.size.width / 2 - 0.5} class:is_activated={$is_activated} />

<style lang="scss">
  circle {
    stroke: #000;
    fill: #fff;
    &.is_activated {
      fill: #f00;
    }
  }
</style>