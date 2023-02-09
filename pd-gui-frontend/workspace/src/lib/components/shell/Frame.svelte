<script lang="ts">
  import { get } from 'svelte/store'

  import type { Frame } from '$lib/shell/wm'
  import { app } from '$lib/stores/app'
  import * as G from '$lib/utils/geometry'

  export let frame: Frame

  let dragging = false
  let resizing = false
  let drag_offset = G.NullPoint()

  function on_clicked_inside() {
    $app.wm.stack_top(frame)
  }

  function on_drag_move(event: MouseEvent) {
    frame.move_to(event.clientX - drag_offset.x, event.clientY - drag_offset.y)
  }

  function on_drag_stop(_: MouseEvent) {
    dragging = false
    window.removeEventListener('mousemove', on_drag_move)
    window.removeEventListener('mouseup', on_drag_stop)
  }

  function on_drag_start(event: MouseEvent) {
    const origin = get(box).origin
    dragging = true
    drag_offset = new G.Point(event.clientX - origin.x, event.clientY - origin.y)
    window.addEventListener('mousemove', on_drag_move)
    window.addEventListener('mouseup', on_drag_stop)
  }

  function on_resize_stop(_: MouseEvent) {
    window.removeEventListener('mousemove', on_resize_move)
    window.removeEventListener('mouseup', on_resize_stop)
  }

  function on_resize_move(event: MouseEvent) {
    frame.resize_by(event.movementX, event.movementY)
  }

  function on_resize_start(_: MouseEvent) {
    resizing = true
    window.addEventListener('mousemove', on_resize_move)
    window.addEventListener('mouseup', on_resize_stop)
  }

  $: box = frame.box
  $: title = frame.title
  $: z_index = frame.z_index
  $: hidden = frame.hidden
  $: is_active = frame.is_active
  $: is_resizable = frame.is_resizable
  $: is_maximized = frame.is_maximized

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
    class:dragging={dragging}
    class:is_active={$is_active}
    >
    <span class="title">{$title}</span>
    <span class="buttons">
      <button
        on:click={_ => frame.hide()}>
        -
      </button>
      {#if $is_resizable}
        <button
          on:click={_ => frame.maximize(window.innerWidth, window.innerHeight)}>
          +
        </button>
      {:else if $is_maximized}
        <button
          on:click={_ => frame.unmaximize()}>
          O
        </button>
      {:else}
        &nbsp;&nbsp;&nbsp;
      {/if}
      <button
        on:click={_ => $app.wm.close_frame(frame)}>
        x
      </button>
    </span>
  </div>
  
  <div class="content">
    <svelte:component this={frame.view.klass.component} {...frame.view.klass.props} frame={frame} />
  </div>

  {#if $is_resizable}
  <div class="resize_grip"
    on:mousedown={on_resize_start}>
  </div>
  {/if}
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
    user-select: none;
    &.hidden {
      display: none;
    }

    &.is_active {
      box-shadow: 1px 1px 8px #ccc;
    }
  }

  .titlebar {
    border-bottom: #ddd solid thin;
    background-color: #eee;
    font-family: 'Courier New', Courier, monospace;
    display: flex;
    justify-content: space-between;
    user-select: none;
    font-size: 13px;
    white-space: nowrap;

    &.is_active {
      background-color: #ddd;
    }

    .title {
      padding: 3px;
    }

    .buttons {
      float: right;
      button {
        outline: none;
        border: none;
        cursor: pointer;
        background: inherit;
      }
    }

    &.dragging {
      cursor: move;
    }
  }

  .content {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .resize_grip {
    cursor: nwse-resize;
    transform: rotate(45deg);
    background-color: #ccca;
    width: 32px;
    height: 32px;
    position: absolute;
    left: calc(var(--width) - 16px);
    top: calc(var(--height) - 16px);
  }
</style>