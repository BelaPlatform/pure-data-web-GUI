<script lang="ts">
  import { get } from 'svelte/store'

  import type { Fenster } from '$lib/stores/wm'
  import { wm } from '$lib/stores/wm'
  import * as G from '$lib/pd/geometry'
  import View from './View.svelte'

  export let fenster: Fenster

  let dragging = false
  let drag_offset = G.NullPoint()

  function on_clicked_inside() {
    $wm.stack_top(fenster)
  }

  function on_drag_move(event:MouseEvent) {
    fenster.move_to(event.clientX - drag_offset.x, event.clientY - drag_offset.y)
  }

  function on_drag_stop(_:MouseEvent) {
    dragging = false
    window.removeEventListener('mousemove', on_drag_move)
    window.removeEventListener('mouseup', on_drag_stop)
  }

  function on_drag_start(event:MouseEvent) {
    const origin = get(box).origin    
    dragging = true
    drag_offset = new G.Point(event.clientX - origin.x, event.clientY - origin.y)
    window.addEventListener('mousemove', on_drag_move)
    window.addEventListener('mouseup', on_drag_stop)
  }

  $: box = fenster.box
  $: title = fenster.title
  $: z_index = fenster.z_index
  $: hidden = fenster.hidden
  $: is_active = fenster.is_active

  import { pd } from '$lib/stores/pd'
  import Canvas from '$lib/components/pd/Canvas.svelte'
  $: canvases = $pd.canvases
</script>

<div class="wrap"
  class:hidden={$hidden}
  class:is_active={$is_active}
  style:--x="{$box.origin.x}px"
  style:--y="{$box.origin.y}px"
  style:--width="{$box.size.width}px"
  style:--height="{$box.size.height}px"
  style:--z_index={$z_index}
  on:mousedown={on_clicked_inside}
  on:keydown={on_clicked_inside}
  >
  <div class="titlebar"
    on:mousedown={on_drag_start}
    >
    <span class="title">{$title} - {fenster.id}</span>
    <span class="buttons">
      <button
        on:click={_ => fenster.hide()}>
        _
      </button>
      <button>
        []
      </button>
      <button
        on:click={_ => $wm.close_window(fenster)}>
        x
      </button>
    </span>
  </div>
  
  <div class="content">
    <!-- <View view={fenster.view} /> -->
    <svelte:component this={fenster.view.klass.component} />
  </div>
</div>

<style lang="scss">
  .wrap {
    position: absolute;
    left: var(--x);
    top: var(--y);
    width: var(--width);
    height: var(--height);
    border: #ddd solid thin;
    z-index: var(--z_index);
    background-color: #fff;
    overflow: hidden;
    box-shadow: 0px 0px 4px #ddd;
    display: flex;
    flex-direction: column;
    &.hidden {
      display: none;
    }

    &.is_active {
      box-shadow: 1px 1px 8px #ccc;
    }
  }

  .titlebar {
    border-bottom: #ddd solid thin;
    font-family: 'Courier New', Courier, monospace;
    display: flex;
    justify-content: space-between;
    user-select: none;
    .title {
      padding: 3px;
    }
    .buttons {
      float: right;
      button {
        outline: none;
        border: none;
        cursor: pointer;
      }
    }
  }

  .content {
    background-color: #eee;
    height: 100%;
  }
</style>