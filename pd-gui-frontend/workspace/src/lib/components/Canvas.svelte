<script lang="ts">
  import { onMount } from 'svelte'

  import { pd } from '$lib/pd/pd'
  import Node from './Node.svelte'
  import Noodle from './Noodle.svelte'

  function on_mousedown(event:MouseEvent) {
    $pd.send_mouse_down(event.offsetX, event.offsetY, event.button)
  }

  function on_mouseup(event:MouseEvent) {
    $pd.send_mouse_up(event.offsetX, event.offsetY, event.button)
  }

  function on_mousemove(event:MouseEvent) {
    $pd.send_motion(event.offsetX, event.offsetY)
  }

  $: canvas = $pd.active_canvas
  $: widgets = $canvas.widgets
  $: connections = $canvas.connections

  onMount(() => {
    // console.log('Canavs::onMount')
  })
</script>

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
    height: 360px;
    border: #0f0 solid thin;
  }
</style>