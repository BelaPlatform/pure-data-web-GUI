<script lang="ts">
  import type { PdWidget } from '$lib/pd/pd_widget'
  import NodeBase from './NodeBase.svelte'

  export let widget:PdWidget

  const offset = 4
  $: left_x = 0
  $: right_x = widget.box.size.width
  $: top_y = 0
  $: bottom_y = widget.box.size.height
  $: points = `${left_x}, ${top_y} ${right_x}, ${top_y} ${right_x - offset}, ${top_y + offset} ${right_x - offset}, ${bottom_y - offset} ${right_x}, ${bottom_y} ${left_x}, ${bottom_y} ${left_x}, ${top_y}`
</script>

<!-- <polyline points={points} class:selected={node.selected} />
<text x="12" y="16" class:selected={node.selected}>
  {widget.text}
</text> -->

<polyline points={points} />
<NodeBase {widget} text_only />

<style>
  polyline {
    fill: #fff;
    stroke: #aaa;
    shape-rendering: crispEdges;
  }

  /* polyline.selected {
    fill: #eee;
    stroke: rgb(38, 236, 20);
  } */
  
  /* text.selected {
    fill: #966;
    stroke-width: 2px;
  } */
</style>
