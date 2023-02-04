<script lang="ts">
  import Headerbar from '$lib/components/shell/HeaderBar.svelte'

  import { pd } from '$lib/stores/pd'
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
  }
</style>