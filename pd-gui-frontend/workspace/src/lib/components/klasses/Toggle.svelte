<script lang="ts">
  import type { PdWidget } from '$lib/pd/pd_widget'
  import NodeBase from './NodeBase.svelte'

  export let widget:PdWidget
  $: is_activated = widget.is_activated
</script>

<NodeBase {widget} />
<line x1={2} x2={16} y1={2} y2={16} class:is_activated={$is_activated} />
<line x1={2} x2={16} y1={16} y2={2} class:is_activated={$is_activated} />

<style lang="scss">
  line {
    stroke: #fff;
    stroke-width: 0.5;
    &.is_activated {
      stroke: #000;
    }
  }
</style>