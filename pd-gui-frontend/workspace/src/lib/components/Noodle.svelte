<script lang="ts">
  import type { PdConnection } from '$lib/pd/pd_connection'

  export let connection:PdConnection

  $: x1 = connection.from.x
  $: x2 = connection.to.x
  $: y1 = connection.from.y
  $: y2 = connection.to.y
  $: distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  // $: offset = distance / 4
  $: offset = 24
  $: path = `M ${x1} ${y1} C ${x1} ${y1 + offset}, ${x2} ${y2 - offset}, ${x2} ${y2}`
  // $: path = `M ${x1} ${y1}, ${x2} ${y2}`
</script>

<path d={path} />


<style>
  path {
    /* stroke: #aaa; */
    stroke: #666;
    stroke-width: 1px;
    fill: transparent;
    /* shape-rendering: crispEdges; */
  }
</style>
