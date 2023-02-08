<script lang="ts">
  import { onMount } from "svelte"

  import { app } from '$lib/stores/app'
  import { pd } from '$lib/stores/pd'
  import { Interpreter } from '$lib/pd/parser/interpreter'
  import { WebSocketIO } from '$lib/pd/io'
  import Frame from '$lib/components/shell/Frame.svelte'

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

  $: wm = $app.wm
  $: frames = wm.frames
</script>

{#each $frames as frame(frame.id)}
  <Frame {frame} />
{/each}
