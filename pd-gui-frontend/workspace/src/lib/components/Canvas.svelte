<script lang="ts">
  import { onMount } from 'svelte'

  import { pd } from '$lib/pd/pd'
  import Node from './Node.svelte'
  import Noodle from './Noodle.svelte'
  import { IOLetScope, IOLetType } from '$lib/pd/pd_widget';

  $: canvas = $pd.active_canvas
  $: widgets = $canvas.widgets
  $: connections = $canvas.connections

  onMount(() => {
    console.log('Canavs::onMount')
  })
</script>

<div class="wrap">
  {$canvas.title} {$canvas.id}

  <svg xmlns="http://www.w3.org/2000/svg">
    {#each $widgets as widget(widget.id)}
      <Node {widget} />
    {/each}
    {#each $connections as connection}
      <Noodle {connection} />
    {/each}
  </svg>

  <h2>connections</h2>
  <ul>
    {#each $connections as connection(connection.id)}
    <li>
      {connection.id}<br>
      {connection.from.x} {connection.from.y}<br>
      {connection.to.x} {connection.to.y}<br>
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

  svg {
    height: 360px;
  }
</style>