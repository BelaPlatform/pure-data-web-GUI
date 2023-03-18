<script lang="ts">
  import type { PdWidget } from '$lib/pd/pd_widget'
  import NodeBase from './NodeBase.svelte'

  export let widget:PdWidget
</script>

<NodeBase {widget} no_bg={true} no_text={true} />
