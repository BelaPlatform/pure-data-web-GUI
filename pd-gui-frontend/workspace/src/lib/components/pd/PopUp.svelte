<script lang="ts">
  import { getContext, onMount } from 'svelte'

  import OutClick from 'svelte-outclick'

  import type { PdCanvas } from '$lib/pd/pd_canvas'

  export let canvas:PdCanvas

  const {getObjectId} = getContext('object-id') as any

  function on_clicked_properties() {
    // don't call Pd
    // or we'd be getting back an undecipherable message like
    // pdtk_iemgui_dialog {.gfxstubd93fb0} |cnv| {} 20 1 {} 0 0 {} {} 24 {} 24 {} 0 -1 {} {} -1 -1 {} -1 {} {} {} 20 12 0 12 #faff00 #000000 #404040 ;
    
    // canvas.on_dismiss_popup_with_result(0)

    // call our own impl instead
    const object_id = getObjectId()
    console.log(`show properties dialog for ${object_id}`)
    canvas.popup.update(p => {
      p.show = false
      return p
    })
  }

  function on_clicked_open() {
    canvas.on_dismiss_popup_with_result(1)
  }

  function on_clicked_help() {
    canvas.on_dismiss_popup_with_result(2)
  }

  $: popup = canvas.popup
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