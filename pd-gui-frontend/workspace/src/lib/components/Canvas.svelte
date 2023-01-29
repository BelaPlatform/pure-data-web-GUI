<script lang="ts">
  import { app } from '$lib/stores/app'
  import { pd } from '$lib/stores/pd'
  import Node from './Node.svelte'
  import Noodle from './Noodle.svelte'
  import PopUp from './PopUp.svelte'

  $: canvas = $pd.active_canvas
  $: widgets = $canvas.widgets
  $: connections = $canvas.connections
  $: edit_mode = $canvas.edit_mode
  $: cursor = $canvas.cursor

  const {show_debug} = app

  function on_mousedown(event:MouseEvent) {
    if (event.button != 0) {
      return
    }
    const button = 1
    const modifiers = (event.ctrlKey ? 2 : 0) + (event.altKey ? 4 : 0)
    // const button = event.button == 2 ? 3 : 1
    $canvas.send_mouse_down(event.offsetX, event.offsetY, button, modifiers)
  }

  function on_contextmenu(event:MouseEvent) {
    $canvas.send_mouse_down(event.offsetX, event.offsetY, 3, 8)
  }

  function on_mouseup(event:MouseEvent) {
    $canvas.send_mouse_up(event.offsetX, event.offsetY, event.button)
  }

  function on_mousemove(event:MouseEvent) {
    // console.log(event)
    // console.log(event.ctrlKey)
    // console.log(event.altKey)
    const modifiers = (event.ctrlKey ? 2 : 0) + (event.altKey ? 4 : 0)
    $canvas.send_motion(event.offsetX, event.offsetY, modifiers)
  }

  function on_keydown(event:KeyboardEvent) {
    // console.log(event)
    // console.log(event.key)

    // first, see if it's a shortcut
    if (event.key == 'e' && event.ctrlKey) {
      event.preventDefault()
      $canvas.on_toggle_edit_mode()
      return
    }

    if (event.key == '1' && event.ctrlKey) {
      event.preventDefault()
      $canvas.on_create_object()
      return
    }

    if (event.key == '2' && event.ctrlKey) {
      event.preventDefault()
      $canvas.on_create_message()
      return
    }

    if (event.key == '3' && event.ctrlKey) {
      event.preventDefault()
      $canvas.on_create_number()
      return
    }

    if (event.key == '5' && event.ctrlKey) {
      event.preventDefault()
      $canvas.on_create_comment()
      return
    }

    // brave grabs ctrl+shift keys and does not let us handle it
    // use altKey for now
    if (event.key == 'B' && event.altKey && event.shiftKey) {
      event.preventDefault()
      $canvas.on_create_bang()
      return
    }

    if (event.key == 'T' && event.altKey && event.shiftKey) {
      event.preventDefault()
      $canvas.on_create_toggle()
      return
    }

    if (event.key == 's' && event.ctrlKey) {
      event.preventDefault()
      $canvas.on_save()
      return
    }

    if (event.key == 'a' && event.ctrlKey) {
      event.preventDefault()
      $canvas.on_select_all()
      return
    }

    if (event.key == 'c' && event.ctrlKey) {
      event.preventDefault()
      $canvas.on_copy()
      return
    }

    if (event.key == 'v' && event.ctrlKey) {
      event.preventDefault()
      $canvas.on_paste()
      return
    }

    if (event.key == 'x' && event.ctrlKey) {
      event.preventDefault()
      $canvas.on_cut()
      return
    }

    if (event.key == 'z' && event.ctrlKey) {
      event.preventDefault()
      $canvas.on_undo()
      return
    }

    if (event.key == 'Control') {
      const key = event.location == 1 ? 'Control_L' : 'Control_R'
      $canvas.send_key_down(key)
    }

    const modifiers = (event.shiftKey ? 1 : 0) + (event.ctrlKey ? 2 : 0) + (event.altKey ? 4 : 0)
    if (event.key == 'ArrowLeft') {
      $canvas.send_key_down('Left', modifiers)
    }

    if (event.key == 'ArrowRight') {
      $canvas.send_key_down('Right', modifiers)
    }

    if (event.key == 'ArrowUp') {
      $canvas.send_key_down('Up', modifiers)
    }

    if (event.key == 'ArrowDown') {
      $canvas.send_key_down('Down', modifiers)
    }

    if (event.key == 'Delete') {
      $canvas.send_key_down('127')
    }

    if (event.key == 'Backspace') {
      $canvas.send_key_down('8')
    }

    if (event.key == ' ') {
      $canvas.send_key_down('32')
    }

    if (event.code.startsWith('Key')) {
      const ascii = event.key.charCodeAt(0)
      $canvas.send_key_down(`${ascii}`)
    }
  }

  function on_keyup(event:KeyboardEvent) {
    // console.log('on_keyup')
    // console.log(event)

    if (event.key == 'Control') {
      const key = event.location == 1 ? 'Control_L' : 'Control_R'
      $canvas.send_key_up(key)
    }
  }
  
</script>

<svelte:window on:keydown={on_keydown} on:keyup={on_keyup}/>

<div class="wrap">
  <PopUp canvas={$canvas} />

  <svg xmlns="http://www.w3.org/2000/svg"
    on:mousedown={on_mousedown}
    on:mousemove={on_mousemove}
    on:mouseup={on_mouseup}
    on:contextmenu|preventDefault={on_contextmenu}
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
      cursor: pointer;
    }

    &.runmode_clickme {
      cursor: inherit;
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