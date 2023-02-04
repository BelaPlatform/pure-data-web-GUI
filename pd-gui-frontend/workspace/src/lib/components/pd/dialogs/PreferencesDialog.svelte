<script lang="ts">
  import { onMount } from 'svelte'

  import { pd } from '$lib/stores/pd'
  import type { Fenster } from '$lib/stores/wm'
  import * as G from '$lib/pd/geometry'
  
  export let fenster: Fenster

  onMount(() => {
    fenster.set_title('Preferences')
    fenster.set_size(new G.Size(480, 240))
    fenster.set_is_resizable(false)
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