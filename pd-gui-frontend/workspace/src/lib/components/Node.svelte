<script lang="ts">
  import Port from './Port.svelte'
  import type { PdWidget } from '$lib/pd/pd_widget'

  export let widget:PdWidget
</script>

<g transform="translate({widget.x},{widget.y})">
  <rect width={120} height={24}/>
  <text x={3} y={16}>{widget.id} # {widget.klass}</text>
  <g>
    {#each widget.inlets as port}
      <Port {port} />
    {/each}
  </g>
  <g transform="translate(0,20)">
    {#each widget.outlets as port}
      <Port {port} />
    {/each}
  </g>
</g>

<style lang="scss">
  rect {
    stroke: #f00;
    fill: #fff;
  }
</style>