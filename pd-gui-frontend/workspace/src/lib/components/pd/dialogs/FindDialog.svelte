<script lang="ts">
  import { onMount } from 'svelte'

  import { pd } from '$lib/stores/pd'
  import type { Fenster } from '$lib/stores/wm'
  import * as G from '$lib/pd/geometry'

  export let fenster: Fenster

  let text: string
  function on_send() {
    console.log("searching " + text)
    text = ""
  }

  onMount(() => {
    fenster.set_title('Find')
    fenster.set_size(new G.Size(288, 80))
    fenster.set_is_resizable(false)
  })
</script>

<div class="wrap">
  Is there an API for this? 
  <form on:submit|preventDefault={on_send}>
    <input type="text" placeholder="Search in Pd for" bind:value={text} />
  </form>
</div>

<style lang="scss">
  .wrap {
    padding: 12px;
    font-family: 'Courier New', Courier, monospace;
  }

  form {
    display: inline-block;
  }

  input {
    size: 120px;
  }
</style>