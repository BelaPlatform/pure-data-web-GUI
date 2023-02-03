<script lang="ts">
  import Headerbar from '$lib/components/HeaderBar.svelte'
</script>

<Headerbar />

<slot></slot>

<style lang="scss">
  :global(html, body) {
    margin: 0;
    padding: 0;
  }
</style>