<script lang="ts">
  import { IOLetType, type IOLet } from '$lib/pd/pd_widget'

  export let port: IOLet
  $: type = port.type == IOLetType.Message ? 'message' : 'signal'
</script>

<rect width={16} height={4} x={port.index * 16} class="{type}" />

<style lang="scss">
  rect {
    stroke: #aaa;
    shape-rendering: crispEdges;

    &.message {
      fill: white;
    }
    &.signal {
      fill: gray;
    }
  }

</style>
