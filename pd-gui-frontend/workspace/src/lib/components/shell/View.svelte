<script lang="ts">
  import type { View } from '$lib/stores/wm'
  export let view:View
</script>

<svelte:component this={view.klass.component} />

