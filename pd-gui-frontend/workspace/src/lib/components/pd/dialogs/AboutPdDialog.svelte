<script lang="ts">
    import { onMount } from 'svelte'
  
    import type { Fenster } from '$lib/stores/wm'
    import * as G from '$lib/pd/geometry'
    
    export let fenster: Fenster
  
    onMount(() => {
      fenster.set_title('About')
      fenster.set_size(new G.Size(480, 600))
      fenster.set_is_resizable(false)
    })
  </script>
  
  <div class="wrap">
    Pd version 0.52.2<br><br>

    A real-time graphical programming environment for live interactive
    computer music, Pd works on Linux, Apple macOS, and Microsoft Windows.<br><br>
    
    Pd is copyrighted, but is free for you to use for any reasonable purpose.<br>
    See the file:<br>
    &nbsp;&nbsp;&nbsp;&nbsp;/opt/pd-gui/lib/pd/LICENSE.txt<br><br>
    
    Reference manual for Pd lives in:<br>
    &nbsp;&nbsp;&nbsp;&nbsp;/opt/pd-gui/lib/pd/doc/1.manual/index.htm<br>
    or online:<br>
    &nbsp;&nbsp;&nbsp;&nbsp;<a href="https://msp.ucsd.edu/Pd_documentation/" rel="noreferrer" target="_blank">https://msp.ucsd.edu/Pd_documentation/</a><br><br>
    
    Information of all sorts (guides, development, meetings, more documentation, etc):<br>
    &nbsp;&nbsp;&nbsp;&nbsp;<a href="https://puredata.info" rel="noreferrer" target="_blank">https://puredata.info</a><br><br>
    
    The Pd mailing list archive lives in:<br>
    &nbsp;&nbsp;&nbsp;&nbsp;<a href="https://lists.puredata.info/pipermail/pd-list" rel="noreferrer" target="_blank">https://lists.puredata.info/pipermail/pd-list</a>
</div>
  
<style lang="scss">
.wrap {
    padding: 12px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
}
</style>