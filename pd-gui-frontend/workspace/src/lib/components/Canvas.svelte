<script lang="ts">
  import { onMount } from 'svelte'

  import { pd } from '$lib/pd/pd'

  $: canvas = $pd.active_canvas
  $: widgets = $canvas.widgets

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
      {widget.id} {widget.klass} {widget.x} {widget.y}
    </li>
    {/each}
  </ul>

  <h2>connections</h2>
  
</div>

<style lang="scss">
  .wrap {
    background-color: #def;
  }
</style>