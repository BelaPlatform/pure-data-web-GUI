<script lang="ts">
  import { IOLetType, type IOLet } from '$lib/pd/pd_widget'

  export let port: IOLet
  $: type = port.type == IOLetType.Message ? 'message' : 'signal'
</script>

<rect width={8} height={2} x={port.index * 16} class="{type}" />

<style lang="scss">
  rect {
    stroke: #aaa;
    stroke: none;
    shape-rendering: crispEdges;

    &.message {
      // fill: white;
      fill: #000;
    }
    &.signal {
      fill: gray;
    }
  }

</style>
