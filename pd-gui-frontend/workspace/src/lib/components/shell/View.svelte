<script lang="ts">
  import { onMount } from 'svelte'

  import type { View } from '$lib/stores/wm'
  
  export let view:View

  onMount(() => {
    console.log('View')
  })
</script>

<svelte:component this={view.klass.component} />

