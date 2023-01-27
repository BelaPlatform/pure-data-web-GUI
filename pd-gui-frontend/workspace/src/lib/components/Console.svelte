<script lang="ts">
	import { onMount } from 'svelte'
  import { createEventDispatcher } from 'svelte'

  import { Direction, PdMessages } from '$lib/pd/pd_messages'

  export let show_console:boolean

  const dispatch = createEventDispatcher()

  let message_container:HTMLElement
  let send_form:HTMLFormElement
  let pd_message_input:HTMLInputElement

  async function on_send_message() {
    const content = new FormData(send_form).get('message')  as string || ""
    dispatch('send_message', content)
    pd_message_input.value = ""
    PdMessages.push(content, Direction.Outgoing)
  }

  function on_set_message(message:string) {
    pd_message_input.value = message
  }

  $: messages = PdMessages.messages

  onMount(() => {
    messages.subscribe(() => {
      message_container.scrollTop = message_container.scrollHeight
    })
  })
</script>

<div class="wrap" class:visible={show_console}>
  <ul id="messages" bind:this={message_container}>
    {#each $messages as message}
      {#if message.isIncoming}    
        <li class="message">
          {message.content} {message.repeat_count}
        </li>
      {:else}
      <li class="message outgoing" on:click={_ => on_set_message(message.content)} on:keydown={_ => on_set_message(message.content)}>
        {message.content}
      </li>
      {/if}
    {/each}
  </ul>
  <div class="readline">
    <form on:submit|preventDefault={on_send_message} bind:this={send_form}>
      <input type="text" placeholder="send message to pd" name="message" bind:this={pd_message_input} size="64">
      <button type="submit">send</button>
    </form>
  </div>
</div>

<style lang="scss">
  div.wrap {
    display: none;
    min-height: 60px;
  }

  div.wrap.visible {
    display: block
  }
  
  #messages {
    list-style: none;
    overflow-y: scroll;
    height: 120px;
    padding: 0;
    margin: 0;
    background-color: #fff;
  }

  .message {
    &.outgoing {
      background-color: pink;
      cursor: pointer;
    }
  }
</style>