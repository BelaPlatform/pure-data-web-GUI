<script lang="ts">
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'

  import { app } from '$lib/stores/app'
  import type { Frame } from '$lib/shell/wm'
  import type { PdCanvas } from '$lib/pd/pd_canvas'
  import * as G from '$lib/utils/geometry'

  export let frame: Frame
  export let canvas: PdCanvas

  let text: string = get(canvas.title).split(' ')[0]
  function on_submit(event: SubmitEvent) {
    if (event.submitter?.textContent === 'Cancel') {
      $app.wm.close_frame(frame)
    } else {
      canvas.on_save_as(text)
      $app.wm.close_frame(frame)
    }
    text = ''
  }

  onMount(() => {
    frame.set_title('Save As')
    frame.set_size(new G.Size(264, 102))
    frame.set_is_resizable(false)
    frame.set_is_hideable(false)
  })
</script>

<div class="wrap">
  <form on:submit|preventDefault={on_submit}>
    <input type="text" placeholder="Filename" bind:value={text} />
    <button type="submit" value="submit">Save</button>
    <button type="submit" value="cancel">Cancel</button>
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
    display: block;
    margin-bottom: 12px;
  }
</style>