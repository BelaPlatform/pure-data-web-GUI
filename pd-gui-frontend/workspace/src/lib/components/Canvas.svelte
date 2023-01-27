<script lang="ts">
  import { onMount } from 'svelte'

  import { pd } from '$lib/pd/pd'

  $: canvas = $pd.active_canvas
  $: widgets = $canvas.widgets
  $: connections = $canvas.connections
  
  onMount(() => {
    console.log('Canavs::onMount')
  })
</script>

<div class="wrap">
  {$canvas.title} {$canvas.id}

  <h2>widgets</h2>
  <ul>
    {#each $widgets as widget(widget.id)}
    <li>
      {widget.id} {widget.klass} &lbrace; {widget.x} {widget.y} &rbrace;
      {widget.inlets} {widget.outlets}
    </li>
    {/each}
  </ul>

  <h2>connections</h2>
  <ul>
    {#each $connections as connection(connection.id)}
    <li>
      {connection.id}
    </li>
    {/each}
  </ul>
</div>

<style lang="scss">
  .wrap {
    background-color: #def;
  }

  li {
    list-style: none;
  }
</style>