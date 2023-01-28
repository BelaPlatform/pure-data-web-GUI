<script lang="ts">
  import type { PdWidget } from '$lib/pd/pd_widget'

  export let widget:PdWidget
  $: is_activated = widget.is_activated
</script>

<circle r={6} cx={7} cy={7} class:is_activated={$is_activated} />

<style lang="scss">
  circle {
    stroke: #000;
    fill: #fff;
    &.is_activated {
      fill: #f00;
    }
  }
</style>