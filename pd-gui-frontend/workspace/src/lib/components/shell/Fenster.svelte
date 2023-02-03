<script lang="ts">
  import type { Fenster } from '$lib/stores/wm'
  import { wm } from '$lib/stores/wm'

  export let fenster: Fenster

  function on_clicked_inside() {
    $wm.stack_top(fenster)
  }

  let dragging = false
  function on_drag_move(event:MouseEvent) {
    fenster.move_to(event.clientX, event.clientY)
  }

  function on_drag_stop(event:MouseEvent) {
    window.removeEventListener('mousemove', on_drag_move)
    window.removeEventListener('mouseup', on_drag_stop)
  }

  function on_drag_start() {
    dragging = true
    window.addEventListener('mousemove', on_drag_move)
    window.addEventListener('mouseup', on_drag_stop)
  }

  $: box = fenster.box
  $: title = fenster.title
  $: z_index = fenster.z_index
  $: hidden = fenster.hidden
</script>

<div class="wrap"
  class:hidden={$hidden}
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

    &.hidden {
      display: none;
    }
    box-shadow: 2px 2px 2px #ccc;
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
</style>