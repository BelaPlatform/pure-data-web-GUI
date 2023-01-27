<script lang="ts">
  import type { PdConnection } from '$lib/pd/pd_connection'

  export let connection:PdConnection

  $: x1 = connection.from_x
  $: x2 = connection.to_x
  $: y1 = connection.from_y
  $: y2 = connection.to_y
  $: distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  $: offset = distance / 4
  //$: offset = 24
  $: path = `M ${x1} ${y1} C ${x1} ${y1 + offset}, ${x2} ${y2 - offset}, ${x2} ${y2}`
</script>

<path d={path} />


<style>
  path {
    stroke: #aaa;
    stroke-width: 1px;
    fill: transparent;
  }
</style>
