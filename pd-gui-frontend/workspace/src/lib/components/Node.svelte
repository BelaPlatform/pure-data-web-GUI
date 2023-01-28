<script lang="ts">
  import Port from './Port.svelte'
  import type { PdWidget } from '$lib/pd/pd_widget'

  export let widget:PdWidget
</script>

<g transform="translate({widget.box.origin.x},{widget.box.origin.y})">
  <rect width={widget.box.size.width} height={widget.box.size.height}/>

  <svelte:component this={widget.klass.impl} {widget} />

  <text x={3} y={-4} class="annotation">{widget.id}</text>
  <g>
    {#each widget.inlets as port}
      <Port {port} />
    {/each}
  </g>
  <g>
    {#each widget.outlets as port}
      <Port {port} />
    {/each}
  </g>
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
    font-size: 12px;
  }

  .annotation {
    font-size: 8px;
  }
</style>