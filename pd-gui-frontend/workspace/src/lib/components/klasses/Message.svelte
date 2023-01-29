<script lang="ts">
  import type { PdWidget } from '$lib/pd/pd_widget'
  import NodeBase from './NodeBase.svelte'

  export let widget:PdWidget

  const offset = 4
  $: box = widget.box
  $: left_x = 0
  $: right_x = $box.size.width
  $: top_y = 0
  $: bottom_y = $box.size.height
  $: points = `${left_x}, ${top_y} ${right_x}, ${top_y} ${right_x - offset}, ${top_y + offset} ${right_x - offset}, ${bottom_y - offset} ${right_x}, ${bottom_y} ${left_x}, ${bottom_y} ${left_x}, ${top_y}`
  $: selected = widget.is_selected
</script>

<polyline points={points} class:selected={$selected} />
<NodeBase {widget} text_only />

<style lang="scss">
  polyline {
    fill: #fff;
    stroke: #aaa;
    shape-rendering: crispEdges;
    &.selected {
      stroke: #00f;
    }
  }
</style>
