<script lang="ts">
  import { onMount } from "svelte"

  import { pd } from '$lib/pd/pd'
  import { WebSocketIO } from '$lib/pd/io'
  import { available_patches } from '$lib/stores/patches'
  import Console from '$lib/components/Console.svelte'
  import Canvas from '$lib/components/Canvas.svelte'

  async function on_send_message(event:CustomEvent) {
    const message = event.detail
    $pd.send(message)
  }

  let selected_patch:any
  async function on_open_patch() {
    $pd.open_patch(selected_patch)
  }

  // the WebSocket HAS to be created in an onMount lifecycle method
  // otherwise, svelte's server-side-prerendering would try to instantiate the WS and fail
  onMount(()  => {
    $pd.use_io(new WebSocketIO('ws://localhost:8081'))
    // $pd.send_init_sequence()
  })

  $: canvases = $pd.canvases
</script>

<header>
  <form on:submit|preventDefault={_ => on_open_patch()}>
    <select bind:value={selected_patch} name="patch" id="patch">
      {#each $available_patches as patch}
        <option value={patch}>{patch.file}</option>
      {/each}
    </select>
    <button type="submit">Open</button>
  </form>
</header>

<div class="l2r">
  <aside>
    <ul class="canvas-list">
      {#each $canvases as canvas}
        <li 
          on:click={_ => $pd.map_canvas_with_id(canvas.id)}
          on:keypress={_ => $pd.map_canvas_with_id(canvas.id)}>
          {canvas.id} {canvas.title}</li>
      {/each}
    </ul>
  </aside>
  <main>
    <Canvas />
  </main>
</div>

<footer>
  <Console show_console={true} on:send_message={(event) => on_send_message(event)} />
</footer>

<style lang="scss">
  header {
    margin-bottom: 12px;
  }

  .l2r {
    border: #f00 solid thin;
    display: flex;
    height: 640px;
    aside {
      border: #0f0 solid thin;
    }
    main {
      border: #00f solid thin;
      flex-grow: 1;
    }
  }

  .canvas-list {
    list-style-type: none;
    margin: 0;
    padding: 0;
    width: 144px;

    li {
      text-decoration: underline;
      cursor: pointer;
    }
  }

  footer {
    position: fixed;
    bottom: 0px;
  }
</style>