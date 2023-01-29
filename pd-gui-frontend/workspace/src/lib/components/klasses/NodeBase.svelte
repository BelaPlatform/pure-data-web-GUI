<script lang="ts">
  import { onMount } from 'svelte'

  import type { PdWidget } from '$lib/pd/pd_widget'

  export let widget:PdWidget
  export let text_only:boolean = false
  export let no_bg:boolean = false

  $: text = widget.text
  $: box = widget.box
</script>

<g>
  {#if !text_only}
    <rect width={$box.size.width} height={$box.size.height} class:no_bg={no_bg} />
  {/if}

  {#if $text != ""}
    <text x={3} y={14}>
      {$text}
    </text>
  {/if}
</g>

<style lang="scss">
  rect {
    stroke: #666;
    fill: #fff;
    shape-rendering: crispEdges;

    &.no_bg {
      fill: none;
    }
  }

  text {
    user-select: none;
    font-family: 'DejaVu Sans Mono', 'Courier New', Courier, monospace;
    font-size: 11px;
  }
</style>