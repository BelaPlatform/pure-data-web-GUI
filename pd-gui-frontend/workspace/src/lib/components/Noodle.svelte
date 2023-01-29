<script lang="ts">
  import type { PdConnection } from '$lib/pd/pd_connection'

  export let connection:PdConnection

  $: from = connection.from
  $: to = connection.to
  $: x1 = $from.x
  $: x2 = $to.x
  $: y1 = $from.y
  $: y2 = $to.y
  $: distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  // $: offset = distance / 4
  $: offset = 24
  // $: path = `M ${x1} ${y1} C ${x1} ${y1 + offset}, ${x2} ${y2 - offset}, ${x2} ${y2}`
  $: path = `M ${x1} ${y1}, ${x2} ${y2}`
  $: selected = connection.is_selected
</script>

<path d={path} class:selected={$selected} />

<style lang="scss">
  path {
    stroke: #666;
    stroke-width: 1px;
    fill: transparent;
    shape-rendering: crispEdges;

    &.selected {
      stroke: #00f;
    }
  }
</style>
