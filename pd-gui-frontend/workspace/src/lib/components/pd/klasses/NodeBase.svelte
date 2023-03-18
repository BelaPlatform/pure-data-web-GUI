<script lang="ts">
  import type { PdWidget } from '$lib/pd/pd_widget'
  import TextField from '../utils/TextField.svelte'

  export let widget:PdWidget
  export let text_only:boolean = false
  export let no_bg:boolean = false
  export let no_text:boolean = false
  export let poly:string|null = null

  $: box = widget.box
  $: selected = widget.is_selected
  $: state = widget.state
  $: bcolor = widget.bcolor
</script>

<g style:--bcolor={$bcolor}>
  {#if poly}
    <polyline points={poly} class:selected={$selected} class:no_bg={no_bg} />
  {:else}
    {#if !text_only}
      <rect width={$box.size.width} height={$box.size.height} class:no_bg={no_bg} class:selected={$selected} class="{$state}"/>
    {/if}
  {/if}
  {#if !no_text}
    <TextField {widget} />
  {/if}
</g>

<style lang="scss">
  rect, polyline {
    stroke: #666;
    fill: var(--bcolor);
    shape-rendering: crispEdges;

    &.no_bg {
      fill: none;
    }

    &.selected {
      stroke: #00f;
    }
  }

  rect {
    &.edit {
      stroke-dasharray: 3 3;
    }

    &.broken {
      stroke-dasharray: 6 6;
    }
  }
</style>