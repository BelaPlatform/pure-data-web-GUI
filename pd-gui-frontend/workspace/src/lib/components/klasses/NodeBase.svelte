<script lang="ts">
  import type { PdWidget } from '$lib/pd/pd_widget'

  export let widget:PdWidget
  export let text_only:boolean = false
  export let no_bg:boolean = false
  export let poly:string|null = null

  $: text = widget.text
  $: box = widget.box
  $: selected = widget.is_selected
  $: state = widget.state
</script>

<g>
  {#if poly}
    <polyline points={poly} class:selected={$selected} class:no_bg={no_bg} />
  {:else}
    {#if !text_only}
      <rect width={$box.size.width} height={$box.size.height} class:no_bg={no_bg} class:selected={$selected} class="{$state}"/>
    {/if}
  {/if}

  {#if $text != ""}
    <text x={3} y={14}>
      {$text}
    </text>
  {/if}
</g>

<style lang="scss">
  rect, polyline {
    stroke: #666;
    fill: #fff;
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

  text {
    user-select: none;
    font-family: 'DejaVu Sans Mono', 'Courier New', Courier, monospace;
    font-size: 11px;
  }
</style>