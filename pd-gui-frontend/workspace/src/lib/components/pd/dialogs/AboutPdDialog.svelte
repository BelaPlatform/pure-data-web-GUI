<script lang="ts">
  import { onMount } from 'svelte'

  import type { Frame } from '$lib/shell/wm'
  import * as G from '$lib/utils/geometry'
  
  export let frame: Frame

  onMount(() => {
    frame.set_title('About')
    frame.set_size(new G.Size(480, 600))
    frame.set_is_resizable(false)
  })
</script>
  
<div class="wrap">
  Pd version 0.52.2<br><br>

  A real-time graphical programming environment for live interactive
  computer music, Pd works on Linux, Apple macOS, Microsoft Windows, and in your Browser.<br><br>
  
  Pd is copyrighted, but is free for you to use for any reasonable purpose.<br>
  See the file:<br>
  &nbsp;&nbsp;&nbsp;&nbsp;/opt/pd-gui/lib/pd/LICENSE.txt<br><br>
  
  Reference manual for Pd lives in:<br>
  &nbsp;&nbsp;&nbsp;&nbsp;/opt/pd-gui/lib/pd/doc/1.manual/index.htm<br>
  or online:<br>
  &nbsp;&nbsp;&nbsp;&nbsp;<strike>https://msp.ucsd.edu/Pd_documentation/</strike><br><br>
  
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