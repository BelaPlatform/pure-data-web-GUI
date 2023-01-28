<script lang="ts">
  import { IOLetType, type IOLet } from '$lib/pd/pd_widget'

  export let port: IOLet

  $: type = port.type == IOLetType.Message ? 'message' : 'signal'
  $: x = port.box.origin.x
  $: y = port.box.origin.y
  $: width = port.box.size.width
  $: height = port.box.size.height
</script>

<rect {width} {height} {x} {y} class="{type}" />

<style lang="scss">
  rect {
    // stroke: #f00;
    // shape-rendering: crispEdges;

    &.message {
      // fill: white;
      fill: #000;
    }
    &.signal {
      fill: gray;
    }
  }

</style>
