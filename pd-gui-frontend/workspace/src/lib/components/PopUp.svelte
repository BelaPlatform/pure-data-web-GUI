<script lang="ts">
  import type { PdCanvas } from '$lib/pd/pd_canvas'

  export let canvas:PdCanvas

  $: popup = canvas.popup

  function on_mousedown() {
    console.log('on_mousedown')
    $popup.show = false
  }
</script>

<svelte:window on:mousedown={on_mousedown} />

<div class="wrap" style:--x={$popup.origin.x + 156}px  style:--y={$popup.origin.y + 48}px class:visible={$popup.show}>
  <ul>
    <li class:disabled={!$popup.has_properties}>Properties</li>
    <li class:disabled={!$popup.has_open}>Open</li>
    <li>Help</li>
  </ul>
</div>

<style lang="scss">
  .wrap {
    position: absolute;
    left: var(--x);
    top: var(--y);
    z-index: 9999;
    width: 96px;
    height: 72px;
    background-color: #ccc;
    font-family: 'Courier New', Courier, monospace;
    font-size: 14px;
    display: none;

    &.visible {
      display: block;
    }
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    line-height: 1.6em;
    padding-left: 6px;
  }

  li {
    &.disabled {
      color: #aaa;
    }
  }
</style>