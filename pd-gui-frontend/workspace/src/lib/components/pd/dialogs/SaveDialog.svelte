<script lang="ts">
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'

  import { app } from '$lib/stores/app'
  import type { Frame } from '$lib/shell/wm'
  import type { PdCanvas } from '$lib/pd/pd_canvas'
  import * as G from '$lib/utils/geometry'

  export let frame: Frame
  export let canvas: PdCanvas

  $: pd = $app.pd

  let text: string = get(canvas.title).split(' ')[0]
  function on_submit(event: SubmitEvent) {
    if (event.submitter?.textContent === 'Yes') {
      canvas.on_save()
      $pd?.on_close(canvas)
    } else if (event.submitter?.textContent === 'No') {
      $pd?.on_close(canvas, 2)
    }
    $app.wm.close_frame(frame)
    text = ''
  }

  onMount(() => {
    frame.set_title('Save?')
    frame.set_size(new G.Size(264, 102))
    frame.set_is_resizable(false)
    frame.set_is_hideable(false)
  })
</script>

<div class="wrap">
  Do you want to save the changes?<br><br>
  <form on:submit|preventDefault={on_submit}>
    <button type="submit" value="submit">Yes</button>
    <button type="submit" value="submit">No</button>
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
</style>