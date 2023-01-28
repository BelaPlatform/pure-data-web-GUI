<script lang="ts">
  import type { PdWidget } from '$lib/pd/pd_widget'

  export let widget:PdWidget
  export let text_only:boolean = false
</script>

<g>
  {#if !text_only}
    <rect width={widget.box.size.width} height={widget.box.size.height} />
  {/if}

  {#if widget.text != ""}
    <text x={3} y={14}>
      {widget.text}
    </text>
  {/if}
</g>

<style lang="scss">
  rect {
    stroke: #666;
    fill: #fff;
    shape-rendering: crispEdges;
  }

  text {
    user-select: none;
    font-family: 'DejaVu Sans Mono', 'Courier New', Courier, monospace;
    font-size: 11px;
  }
</style>