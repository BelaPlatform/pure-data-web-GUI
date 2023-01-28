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
    console.log(event)
    // which is deprecated
    // console.log(event.which)
    
    // keyCode is deprecated
    // console.log(event.keyCode)

    // code represents the actual key on a keyboard
    // keyboard layouts are not atken into account
    // console.log(event.code)

    // key: what's that?
    console.log(event.key)
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
    on:mouseup={on_mouseup}>
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
      {widget.klass} {widget.text} {widget.id} ({widget.box.size.width}/{widget.box.size.height})
      ins: {widget.inlets.length} outs: {widget.outlets.length}
    </li>
  {/each}
  </ul>

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
    // border: #0f0 solid thin;
  }
</style>