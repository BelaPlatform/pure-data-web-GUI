<script lang="ts">
  import Port from './Port.svelte'
  import type { PdWidget } from '$lib/pd/pd_widget'

  export let widget:PdWidget
  $: is_activated = widget.is_activated
</script>

<g transform="translate({widget.box.origin.x},{widget.box.origin.y})">
  <rect width={widget.box.size.width} height={widget.box.size.height}/>
  <text x={3} y={16}>
    {#if widget.klass == 'bang'}
      {$is_activated ? 'B' : ''}
    {:else if widget.klass == 'toggle'}
      {$is_activated ? 'X' : ''}
    {:else} 
      {widget.text}
    {/if}
  </text>

  <text x={3} y={-4} class="annotation">{widget.klass} # {widget.id}</text>
  <g transform="translate(0, {0.5})">
    {#each widget.inlets as port}
      <Port {port} />
    {/each}
  </g>
  <g transform="translate(0, {widget.box.size.height - 2.5})">
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