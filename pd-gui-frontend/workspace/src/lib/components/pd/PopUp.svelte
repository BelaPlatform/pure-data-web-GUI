<script lang="ts">
	import OutClick from 'svelte-outclick'

  import type { PdCanvas } from '$lib/pd/pd_canvas'

  export let canvas:PdCanvas

  $: popup = canvas.popup

  function on_clicked_properties() {
    canvas.on_dismiss_popup_with_result(0)
  }

  function on_clicked_open() {
    canvas.on_dismiss_popup_with_result(1)
  }

  function on_clicked_help() {
    canvas.on_dismiss_popup_with_result(2)
  }

</script>

<OutClick on:outclick={_ => canvas.on_dismiss_popup()}>
  <div class="wrap" style:--x={$popup.origin.x}px  style:--y={$popup.origin.y}px class:visible={$popup.show}>
    <ul>
      <li class:disabled={!$popup.has_properties}
        on:click={on_clicked_properties}
        on:keydown={on_clicked_properties}
        >
        Properties</li>
      <li class:disabled={!$popup.has_open}
        on:click={on_clicked_open}
        on:keydown={on_clicked_open}
        >
        Open</li>
      <li
        on:click={on_clicked_help}
        on:keydown={on_clicked_help}
        >
        Help</li>
    </ul>
  </div>
</OutClick> 

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