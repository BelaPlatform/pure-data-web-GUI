<script lang="ts">
  import { setContext } from 'svelte'

  import { app } from '$lib/stores/app'
  import type { PdCanvas } from '$lib/pd/pd_canvas'
  import Node from './Node.svelte'
  import Noodle from './Noodle.svelte'
  import PopUp from './PopUp.svelte'

  export let canvas: PdCanvas
  export let is_active: boolean

  $: widgets = canvas.widgets
  $: connections = canvas.connections
  $: cursor = canvas.cursor

  function on_mousedown(event:MouseEvent) {
    if (event.button != 0) {
      return
    }
    const button = 1
    const modifiers = (event.ctrlKey ? 2 : 0) + (event.altKey ? 4 : 0)
    canvas.send_mouse_down(event.offsetX, event.offsetY, button, modifiers)
  }

  function find_node_for_target(target:any) {
    let node_id = ""
    let element = target as HTMLElement
    while(true) {
      if (element.hasAttribute('data-node-id')) {
        node_id = element.getAttribute('data-node-id')!
        break
      }
      if(element.parentElement) {
        element = element.parentElement
        continue
      }
      break
    }
    return node_id
  }

  let popup_context_object_id = ""
  setContext('object-id', {
    getObjectId: () => popup_context_object_id
  })

  function on_contextmenu(event:MouseEvent) {
    popup_context_object_id = find_node_for_target(event.target)
    canvas.send_mouse_down(event.offsetX, event.offsetY, 3, 8)
  }

  function on_mouseup(event:MouseEvent) {
    canvas.send_mouse_up(event.offsetX, event.offsetY, event.button)
  }

  function on_mousemove(event:MouseEvent) {
    const modifiers = (event.ctrlKey ? 2 : 0) + (event.altKey ? 4 : 0)
    canvas.send_motion(event.offsetX, event.offsetY, modifiers)
  }

  function on_keydown(event:KeyboardEvent) {
    // console.log('Canvas::on_keydown')
    if (!is_active) { return }

    if (event.key == 'e' && event.ctrlKey) {
      event.preventDefault()
      canvas.on_toggle_edit_mode()
      return
    }

    if (event.key == '1' && event.ctrlKey) {
      event.preventDefault()
      canvas.on_put('obj')
      return
    }

    if (event.key == '2' && event.ctrlKey) {
      event.preventDefault()
      canvas.on_put('msg')
      return
    }

    if (event.key == '3' && event.ctrlKey) {
      event.preventDefault()
      canvas.on_put('floatatom')
      return
    }

    if (event.key == '5' && event.ctrlKey) {
      event.preventDefault()
      canvas.on_put('text')
      return
    }

    // brave grabs ctrl+shift keys and does not let us handle it
    // use altKey for now
    if (event.key == 'B' && event.altKey && event.shiftKey) {
      event.preventDefault()
      canvas.on_put('bng')
      return
    }

    if (event.key == 'T' && event.altKey && event.shiftKey) {
      event.preventDefault()
      canvas.on_put('toggle')
      return
    }

    if (event.key == 'z' && event.ctrlKey) {
      event.preventDefault()
      canvas.on_undo()
      return
    }

    if (event.key == 'a' && event.ctrlKey) {
      event.preventDefault()
      canvas.on_select_all()
      return
    }

    if (event.key == 'd' && event.ctrlKey) {
      event.preventDefault()
      canvas.on_duplicate()
      return
    }

    if (event.key == 'R' && event.ctrlKey) {
      event.preventDefault()
      canvas.on_tidy()
      return
    }

    if (event.key == 'k' && event.ctrlKey) {
      event.preventDefault()
      canvas.on_connect_selection()
      return
    }

    if (event.key == 'Control') {
      const key = event.location == 1 ? 'Control_L' : 'Control_R'
      canvas.send_key_down(key)
    }

    const modifiers = (event.shiftKey ? 1 : 0) + (event.ctrlKey ? 2 : 0) + (event.altKey ? 4 : 0)
    if (event.key == 'ArrowLeft') {
      canvas.send_key_down('Left', modifiers)
    }

    if (event.key == 'ArrowRight') {
      canvas.send_key_down('Right', modifiers)
    }

    if (event.key == 'ArrowUp') {
      canvas.send_key_down('Up', modifiers)
    }

    if (event.key == 'ArrowDown') {
      canvas.send_key_down('Down', modifiers)
    }

    if (event.key == 'Delete') {
      canvas.send_key_down('127')
    }

    if (event.key == 'Backspace') {
      canvas.send_key_down('8')
    }

    if (event.key == 'Enter') {
      canvas.send_key_down('10')
    }

    if (event.key == ' ') {
      canvas.send_key_down('32')
    }

    // if event.key is of length 1, assume it's an ascii character
    if (event.key.length == 1) {
      const ascii = event.key.charCodeAt(0)
      canvas.send_key_down(`${ascii}`)
    }
  }

  function on_keyup(event:KeyboardEvent) {
    // console.log('on_keyup')
    // console.log(event)
    if (!is_active) { return }
    if (event.key == 'Control') {
      const key = event.location == 1 ? 'Control_L' : 'Control_R'
      canvas.send_key_up(key)
    }
  }

  let canvas_svg_element:SVGSVGElement
  function on_touchstart(event: TouchEvent) {
    event.preventDefault()
    for (let i = 0; i < event.changedTouches.length; ++i) {
      const touch = event.changedTouches[i]
      const box = canvas_svg_element.getBoundingClientRect()
      const button = 1
      const modifiers = 0
      const x = touch.clientX - box.x
      const y = touch.clientY - box.y
      $app.log(`touchstart ${x} ${y}`)
      canvas.send_mouse_down(x, y, button, modifiers)
    }
  }
  
  function on_touchmove(event: TouchEvent) {
    event.preventDefault()
    for (let i = 0; i < event.changedTouches.length; ++i) {
      const touch = event.changedTouches[i]
      const box = canvas_svg_element.getBoundingClientRect()
      const modifiers = 0
      const x = touch.clientX - box.x
      const y = touch.clientY - box.y
      $app.log(`touchmove ${x} ${y}`)
      canvas.send_motion(x, y, modifiers)
    }
  }

  function on_touchend(event: TouchEvent) {
    event.preventDefault()
    for (let i = 0; i < event.changedTouches.length; ++i) {
      const touch = event.changedTouches[i]
      const box = canvas_svg_element.getBoundingClientRect()
      const button = 1
      const x = touch.clientX - box.x
      const y = touch.clientY - box.y
      $app.log(`touend ${x} ${y}`)
      canvas.send_mouse_up(x, y, button)
    }
  }

</script>

<svelte:window on:keydown={on_keydown} on:keyup={on_keyup} />

<div class="wrap">
  <PopUp canvas={canvas} />

  <svg xmlns="http://www.w3.org/2000/svg"
    on:mousedown={on_mousedown}
    on:mousemove={on_mousemove}
    on:mouseup={on_mouseup}
    on:touchstart={on_touchstart}
    on:touchmove={on_touchmove}
    on:touchend={on_touchend}
    on:contextmenu|preventDefault={on_contextmenu}
    class={$cursor}
    bind:this={canvas_svg_element}>
    {#each $widgets as widget(widget.id)}
      <Node {widget} />
    {/each}
    {#each $connections as connection}
      <Noodle {connection} />
    {/each}
  </svg>
</div>

<style lang="scss">
  svg {
    width: 100%;
    height: 480px;
    user-select: none;
    -webkit-touch-callout: none;
    -webkit-user-select: none;

    &.runmode_nothing {
      cursor: inherit;
    }

    &.editmode_nothing {
      cursor: pointer;
    }

    &.runmode_clickme {
      cursor: inherit;
    }

    &.editmode_resize {
      cursor: ew-resize;
    }

    &.editmode_connect {
      cursor: grab;
    }

    &.editmode_disconnect {
      cursor: no-drop;
    }
  }
</style>