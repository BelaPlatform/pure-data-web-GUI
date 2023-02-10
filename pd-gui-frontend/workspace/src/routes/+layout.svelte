<script lang="ts">
  console.log('+layout::module')
</script>

<slot></slot>

<style lang="scss">
  :global(html, body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: #eee;
  }
</style>