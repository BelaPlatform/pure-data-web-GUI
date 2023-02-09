<script lang="ts">
  import { onMount } from 'svelte'

  import type { Frame } from '$lib/shell/wm'
  import * as G from '$lib/utils/geometry'

  export let frame: Frame

  let text: string
  function on_send() {
    console.log("searching " + text)
    text = ""
  }

  onMount(() => {
    frame.set_title('Find')
    frame.set_size(new G.Size(288, 80))
    frame.set_is_resizable(false)
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