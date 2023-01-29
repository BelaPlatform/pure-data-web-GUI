<script lang="ts">
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'

  import { app } from '$lib/stores/app'
  import { pd } from '$lib/stores/pd'
  import Node from './Node.svelte'
  import Noodle from './Noodle.svelte'

  $: canvas = $pd.active_canvas
  $: widgets = $canvas.widgets
  $: connections = $canvas.connections
  $: edit_mode = $canvas.edit_mode
  $: cursor = $canvas.cursor

  const {show_debug} = app

  function on_mousedown(event:MouseEvent) {
    $canvas.send_mouse_down(event.offsetX, event.offsetY, event.button)
  }

  function on_mouseup(event:MouseEvent) {
    $canvas.send_mouse_up(event.offsetX, event.offsetY, event.button)
  }

  function on_mousemove(event:MouseEvent) {
    $canvas.send_motion(event.offsetX, event.offsetY)
  }

  function on_keydown(event:KeyboardEvent) {
    // console.log(event)
    // console.log(event.key)

    // first, see if it's a shortcut
    if (event.key == 'e' && event.ctrlKey) {
      event.preventDefault()
      $canvas.toggle_edit_mode()
      return
    }

    // if not a shortcut, forward the key to pd
    if (event.key == 'Control') {
      const key = event.location == 1 ? 'Control_L' : 'Control_R'
      $canvas.send_key(key, true)
    }
  }

  function on_keyup(event:KeyboardEvent) {
    console.log(event)
  }  
  
</script>

<svelte:window on:keydown={on_keydown} on:keyup={on_keyup}/>

<div class="wrap">
  <svg xmlns="http://www.w3.org/2000/svg"
    on:mousedown={on_mousedown}
    on:mousemove={on_mousemove}
    on:mouseup={on_mouseup}
    class={$cursor}>
    {#each $widgets as widget(widget.id)}
      <Node {widget} />
    {/each}
    {#each $connections as connection}
      <Noodle {connection} />
    {/each}
  </svg>
  <br>
  
  <!-- {$canvas.title} {$canvas.id}
  <h4>widgets</h4>
  <ul>
  {#each $widgets as widget(widget.id)}
    <li>
      {widget.klass} {widget.text} {widget.id} ({get(widget.box).size.width}/{get(widget.box).size.height})
      ins: {widget.inlets.length} outs: {widget.outlets.length}
    </li>
  {/each}
  </ul> -->
  <!-- 
  <h4>connections</h4>
  <ul>
    {#each $connections as connection(connection.id)}
    <li>
      {connection.id} &lbrace;({connection.from.x}/{connection.from.y}), ({connection.to.x} {connection.to.y})&rbrace;
    </li>
    {/each}
  </ul> -->

  <input type="checkbox" id="show_debug" bind:checked={$show_debug} /><label for="show_debug">Debug</label><br>
  <input type="checkbox" id="edit_mode" bind:checked={$edit_mode} /><label for="edit_mode">Edit Mode</label><br>

</div>

<style lang="scss">
  // .wrap {
  //   background-color: #def;
  // }

  // h4 {
  //   margin: 0;
  // }

  // ul {
  //   list-style: none;
  //   margin: 0;
  //   padding: 0;
  // }

  svg {
    width: 100%;
    height: 480px;

    &.runmode_nothing {
      cursor: inherit;
    }

    &.editmode_nothing {
      cursor: inherit;
    }

    &.runmode_clickme {
      cursor: pointer;
    }

    &.editmode_resize {
      cursor: ew-resize;
    }

    &.editmode_connect {
      cursor: grab;
    }

    &.editmode_disconnect {
      cursor: no-drop;
    }
  }
</style>