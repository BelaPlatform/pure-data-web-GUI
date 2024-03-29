<script lang="ts">
  import { onMount } from 'svelte'

  import { app } from '$lib/stores/app'
  import Headerbar from '$lib/components/shell/HeaderBar.svelte'
  import Frame from '$lib/components/shell/Frame.svelte'

  let desktop_size = {width: 0, height: 0}
  let desktop: HTMLDivElement

  function on_resize() {
    wm.desktop_size.width = desktop_size.width
    wm.desktop_size.height = desktop_size.height
  }

  function on_mousemove(event: MouseEvent) {
    wm.on_mousemove(event)
  }

  function on_mousedown(event: MouseEvent) {
    wm.on_mousedown(event)
  }

  function on_mouseup(event: MouseEvent) {
    wm.on_mouseup(event)
  }

  onMount(async ()  => {
    $app.on_startup()
    wm.desktop_size.width = desktop_size.width
    wm.desktop_size.height = desktop_size.height
  })

  $: wm = $app.wm
  $: frames = wm.frames
  $: pd = $app.pd
  $: dsp = $pd?.dsp_is_on
  $: error_ = $app.error
</script>

<svelte:window
  on:keydown={(event) => $app.wm.on_keydown(event)}
  on:beforeunload={(event) => $app.on_beforeunload(event) }
  on:resize={on_resize} />

<div id="desktop"
  bind:this={desktop}
  bind:clientWidth={desktop_size.width}
  bind:clientHeight={desktop_size.height}
  on:mousemove={on_mousemove}
  on:mousedown={on_mousedown}
  on:mouseup={on_mouseup}>

  {#if $pd}
    <Headerbar>
      <input type="checkbox"
        id="dsp"
        bind:checked={$dsp}
        on:click={_ => $pd?.on_toggle_dsp()}
        />
      <label for="dsp">DSP</label>
    </Headerbar>

    {#each $frames as frame(frame.id)}
      <Frame {frame} />
    {/each}
  {:else}
    <div id="splash">
      {#if $error_ == 'pd_unavailable'}
        <h1>PD is disconnected</h1>
      {:else if $error_ == 'client_connected'}
        <h1>Client connection already taken</h1>
      {:else if $error_ == 'service_unavailable'}
        <h1>
          Service unavailable.<br>
          Start the backend and refresh your browser window.
        </h1>
      {:else}
        <h1>
          Waiting for the shim to connect.
        </h1>
      {/if}
    </div>
  {/if}
</div>

<style lang="scss">
  #desktop {
    width: 100vw;
    height: 100vh;
    box-sizing: border-box;
  }

  #splash {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    h1 {
      text-align: center;
      background-color: #999;
      color: transparent;
      text-shadow: 0px 2px 3px rgba(255,255,255,0.5);
      -webkit-background-clip: text;
        -moz-background-clip: text;
              background-clip: text;
    }
  }
</style>