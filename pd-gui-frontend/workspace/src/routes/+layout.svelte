<script lang="ts">
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'

  import Headerbar from '$lib/components/shell/HeaderBar.svelte'
  import PdDialog from '$lib/components/pd/dialogs/PdDialog.svelte'
  import { app } from '$lib/stores/app'
  import { pd } from '$lib/stores/pd'
  import { Direction, PdMessages } from '$lib/pd/pd_messages'

  onMount(() => {
    console.log('+layout::onMount')
    get(app).wm.new_dialog_frame(PdDialog)
    PdMessages.push('Hello, World!', Direction.Internal)
  })
  $: dsp = $pd.dsp_is_on
</script>

<Headerbar>
  <input type="checkbox" 
    id="dsp"
    bind:checked={$dsp} 
    on:click={_ => $pd.on_toggle_dsp()}
    />
  <label for="dsp">DSP</label>
</Headerbar>

<slot></slot>

<style lang="scss">
  :global(html, body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: #eee;
  }
</style>