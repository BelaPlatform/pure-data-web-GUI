<script lang="ts">
  import { onMount } from 'svelte'

  import { app } from '$lib/stores/app'
  import Headerbar from '$lib/components/shell/HeaderBar.svelte'
  import Frame from '$lib/components/shell/Frame.svelte'

  onMount(async ()  => {
    $app.on_startup()
  })

  $: wm = $app.wm
  $: frames = wm.frames
  $: pd = $app.pd
  $: dsp = pd.dsp_is_on
</script>

<svelte:window on:keydown={(event) => $app.wm.on_keydown(event)} />

<Headerbar>
  <input type="checkbox" 
    id="dsp"
    bind:checked={$dsp} 
    on:click={_ => pd.on_toggle_dsp()}
    />
  <label for="dsp">DSP</label>
</Headerbar>

{#each $frames as frame(frame.id)}
  <Frame {frame} />
{/each}
