<script lang="ts">
  import { onMount } from 'svelte'

  import type { Frame } from '$lib/shell/wm'
  import * as G from '$lib/utils/geometry'
  import { Direction, PdMessages } from '$lib/pd/pd_messages'

  export let frame: Frame

  let message_container:HTMLElement

  onMount(() => {
    frame.set_title('Pd')
    frame.set_size(new G.Size(480, 360))
    PdMessages.messages.subscribe(() => {
      if (message_container) {
        message_container.scrollTop = message_container.scrollHeight
      }
    })
  })

  $: messages = PdMessages.messages
</script>

<div class="wrap">
  <ul id="messages" bind:this={message_container}>
    {#each $messages as message}
      {#if message.direction == Direction.Incoming}
        <li class="message">
          {#if message.repeat_count != 0}
            [{message.repeat_count}]
          {/if}
          {message.content}
        </li>
      {:else if message.direction == Direction.Outgoing}
        <li class="message outgoing">
          {message.content}
        </li>
      {:else}
        <li class="message internal">
          {message.content}
        </li>
      {/if}
    {/each}
  </ul>
</div>

<style lang="scss">
  .wrap {
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
    height: 100%;
  }

  #messages {
    list-style: none;
    overflow-y: scroll;
    height: 100%;
    width: 100%;
    padding: 0;
    padding-left: 2px;
    margin: 0;
    background-color: #fff;
  }

  .message {
    &.outgoing {
      background-color: pink;
      cursor: pointer;
    }

    &.internal {
      color:gray;
      cursor: pointer;
    }
  }
</style>