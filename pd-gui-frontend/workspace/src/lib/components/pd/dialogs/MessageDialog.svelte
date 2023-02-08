<script lang="ts">
  import { onMount } from 'svelte'

  import { pd } from '$lib/stores/pd'
  import type { Frame } from '$lib/stores/wm'
  import * as G from '$lib/pd/geometry'

  export let frame: Frame

  let text: string
  function on_send() {
    console.log(text)
    $pd.send(text)
    text = ""
  }

  onMount(() => {
    frame.set_title('Send a Pd message')
    frame.set_size(new G.Size(396, 92))
    frame.set_is_resizable(false)
  })
</script>

<div class="wrap">
  <form on:submit|preventDefault={on_send}>
    <input type="text" placeholder="message" bind:value={text} />
  </form>
</div>

<style lang="scss">
  .wrap {
    padding: 12px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 36px;
  }

  form {
    display: inline-block;

    &::before {
      content: ";";
    }
  }

  input {
    font-size: 24px;
  }
</style>