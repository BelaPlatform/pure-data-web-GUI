<script lang="ts">
  import { onMount } from 'svelte'

  import type { Frame } from '$lib/shell/wm'
  import * as G from '$lib/utils/geometry'
  
  export let frame: Frame

  onMount(() => {
    frame.set_title('Audio Settings')
    frame.set_size(new G.Size(360, 480))
    frame.set_is_resizable(false)
  })
</script>

<div class="wrap">

</div>

<style lang="scss">
  .wrap {
    padding: 12px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
  }
</style>