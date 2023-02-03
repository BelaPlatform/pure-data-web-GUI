<script lang="ts">
  import { app } from '$lib/stores/app'
  import Port from './Port.svelte'
  import type { PdWidget } from '$lib/pd/pd_widget'

  export let widget:PdWidget

  const {show_debug} = app
  
  $: box = widget.box
  $: label = widget.label
  $: lcolor = widget.lcolor
  $: labelpos = widget.labelpos
</script>

<g transform="translate({$box.origin.x},{$box.origin.y})">
  <svelte:component this={widget.klass.impl} {widget} />
  {#if $show_debug}
    <text x={3} y={-4} class="annotation">{widget.klassname} # {widget.id}</text>
  {/if}

  {#if $label != ""}
    <text x={$labelpos.x} y={$labelpos.y} class="label" style:--lcolor={$lcolor}>{$label}</text>
  {/if}
  
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
  text {
    user-select: none;
    font-family: 'DejaVu Sans Mono', 'Courier New', Courier, monospace;
    font-size: 12px;
  }

  .annotation {
    font-size: 8px;
  }

  .label {
    fill: var(--lcolor);
  }
</style>