<script lang="ts">
  import { onMount } from "svelte"

  // import { wm } from '$lib/stores/wm'
  import { app } from '$lib/stores/app'
  import { pd } from '$lib/stores/pd'
  import { Interpreter } from '$lib/pd/parser/interpreter'
  import { WebSocketIO } from '$lib/pd/io'
  import { available_patches } from '$lib/stores/patches'
  import Console from '$lib/components/Console.svelte'
  import Canvas from '$lib/components/pd/Canvas.svelte'
  import Fenster from '$lib/components/shell/Fenster.svelte'

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
  let io: WebSocketIO
  // let interpreter: Interpreter
  onMount(()  => {
    // interpreter = new Interpreter($pd)
    io = new WebSocketIO('ws://localhost:8081')
    io.on_message = (event:MessageEvent) => {
      const interpreter = new Interpreter($pd)
      interpreter.interpret(event.data)
    }
    $pd.use_io(io)
  })

  let selected_patch:any
  $: dsp = $pd.dsp_is_on
  $: wm = $app.wm
  $: windows = wm.windows
</script>

{#each $windows as fenster(fenster.id)}
  <Fenster {fenster} />
{/each}

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

<style lang="scss">
  header {
    margin-bottom: 12px;
    display: flex;

    form {
      margin-right: 24px;
    }
  }
</style>