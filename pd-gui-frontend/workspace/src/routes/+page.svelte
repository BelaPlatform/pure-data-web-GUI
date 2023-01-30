<script lang="ts">
  import { onMount } from "svelte"

  import { pd } from '$lib/stores/pd'
  import { parse } from '$lib/pd/parser/'
  import { WebSocketIO } from '$lib/pd/io'
  import { available_patches } from '$lib/stores/patches'
  import Console from '$lib/components/Console.svelte'
  import Canvas from '$lib/components/Canvas.svelte'

  async function on_send_message(event:CustomEvent) {
    const message = event.detail
    $pd.send(message)
  }

  function on_open() {
    console.log('on_open')
    // https://developer.mozilla.org/en-US/docs/Web/API/window/showOpenFilePicker
    // window.showOpenFilePicker()

    // 
  }

  // the WebSocket HAS to be created in an onMount lifecycle method
  // otherwise, svelte's server-side-prerendering would try to instantiate the WS and fail
  let io:WebSocketIO
  onMount(()  => {
    io = new WebSocketIO('ws://localhost:8081')
    io.on_message = (event:MessageEvent) => {
      parse(event.data)
    }
    $pd.use_io(io)
  })

  let selected_patch:any
  $: canvases = $pd.canvases
  $: dsp = $pd.dsp_is_on
</script>

<header>
  <form on:submit|preventDefault={_ => $pd.on_open_patch(selected_patch)}>
    <select bind:value={selected_patch} name="patch" id="patch">
      {#each $available_patches as patch}
        <option value={patch}>{patch.file}</option>
      {/each}
    </select>
    <button type="submit">Open</button>
  </form>
  <input type="checkbox" 
    id="dsp"
    bind:checked={$dsp} 
    on:click={_ => $pd.on_toggle_dsp()}
    />
  <label for="dsp">DSP</label>
</header>

<div class="l2r">
  <aside>
    <ul class="canvas-list">
      {#each $canvases as canvas}
        <li 
          on:click={_ => $pd.on_map_canvas_with_id(canvas.id)}
          on:keypress={_ => $pd.on_map_canvas_with_id(canvas.id)}
          >
          {canvas.title} 
          <button 
            on:click={_ => $pd.on_close(canvas)}
            on:keydown={_ => $pd.on_close(canvas)}
            >
            x
          </button>
        </li>
      {/each}
      <li
        on:click={_ => $pd.on_create_new_canvas()}
        on:keypress={_ => $pd.on_create_new_canvas()}
        >
        New
      </li>
      <li
        on:click={on_open}
        on:keypress={on_open}
        >
        <form>
          <input type="file" id="open_file" />
          <!-- <button type="submit">Open File</button> -->
        </form>
      </li>
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
    display: flex;

    form {
      margin-right: 24px;
    }
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