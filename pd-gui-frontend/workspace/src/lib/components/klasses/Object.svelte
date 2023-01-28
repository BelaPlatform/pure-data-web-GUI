<script lang="ts">
  import type { PdWidget } from '$lib/pd/pd_widget'

  export let widget:PdWidget
</script>

<text x={3} y={16}>
  {widget.text}
</text>

<style lang="scss">
  text {
    user-select: none;
    font-family: 'DejaVu Sans Mono', 'Courier New', Courier, monospace;
    font-size: 12px;
  }
</style>