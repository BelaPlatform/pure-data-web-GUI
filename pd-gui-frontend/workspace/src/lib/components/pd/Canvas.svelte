<script lang="ts">
  import { onMount, setContext } from 'svelte'
  import { get } from 'svelte/store'

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
  $: size = canvas.size
  $: required_size = canvas.required_size

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

  let canvas_container: HTMLDivElement
  let canvas_svg_element: SVGSVGElement

  function global_to_local(event:MouseEvent) {
    const origin = get(canvas.origin)
    const x = event.clientX - origin.x + canvas_container.scrollLeft
    const y = event.clientY - origin.y + canvas_container.scrollTop
    return {x, y}
  }


  let popup_context_object_id = ""
  setContext('object-id', {
    getObjectId: () => popup_context_object_id
  })

  function on_contextmenu(event:MouseEvent) {
    const {x, y} = global_to_local(event)
    popup_context_object_id = find_node_for_target(event.target)
    // add a small negative offset to make sure the popup is under the mouse
    // and does not close when the mouse button is released
    canvas.send_mouse_down(x - 2, y - 2, 3, 8)
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
    if (event.code == 'KeyB' && event.altKey && event.shiftKey) {
      event.preventDefault()
      canvas.on_put('bng')
      return
    }

    if (event.code == 'KeyT' && event.altKey && event.shiftKey) {
      event.preventDefault()
      canvas.on_put('toggle')
      return
    }

    if (event.code == 'KeyJ' && event.altKey && event.shiftKey) {
      event.preventDefault()
      canvas.on_put('hslider')
      return
    }

    if (event.code == 'KeyV' && event.altKey && event.shiftKey) {
      event.preventDefault()
      canvas.on_put('vslider')
      return
    }

    if (event.key == 'z' && event.ctrlKey) {
      event.preventDefault()
      canvas.on_undo()
      return
    }

    if (event.key == 'Z' && event.ctrlKey) {
      event.preventDefault()
      canvas.on_redo()
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

    if (event.key == 'Home' || event.key == 'End') {
      canvas.send_key_down(event.key)
    }

    if (event.key == ' ') {
      canvas.send_key_down('32')
      return
    }

    // if event.key is of length 1, assume it's an ascii character
    if (event.key.length == 1) {
      let ascii = event.key.charCodeAt(0)
      if(732 === ascii) // some keyboards create a high-tilde. We pass it down as a regular tilde
        ascii = 126;
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

  function on_touchstart(event: TouchEvent) {
    event.preventDefault()
    for (let i = 0; i < event.changedTouches.length; ++i) {
      const touch = event.changedTouches[i]
      const box = canvas_svg_element.getBoundingClientRect()
      const button = 1
      const modifiers = 0
      const x = touch.clientX - box.x
      const y = touch.clientY - box.y
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
      canvas.send_mouse_up(x, y, button)
    }
  }

  function on_scroll() {
    const x = canvas_container.scrollLeft
    const y = canvas_container.scrollTop
    canvas.on_scroll(x, y)
  }

  onMount(() => {
    canvas.text_edit_mode_enabled.subscribe(is_enabled => {
      if (is_enabled && $app.user_agent.is_mobile) {
        const text = prompt("enter obj text") || ""
       for (let idx = 0; idx < text.length; ++idx) {
          const char_code = text.charCodeAt(idx)
          canvas.send_key_down(`${char_code}`)
        }
      }
    })
  })
</script>

<svelte:window on:keydown={on_keydown} on:keyup={on_keyup} />

<div class="wrap"
  bind:this={canvas_container}
  on:scroll={on_scroll}>
  <div class="debug">
    {`${$required_size.width}px x ${$required_size.height}px`}
  </div>
  <PopUp canvas={canvas} />
  <svg xmlns="http://www.w3.org/2000/svg"
    data-canvas-id="{canvas.id}"
    on:touchstart={on_touchstart}
    on:touchmove={on_touchmove}
    on:touchend={on_touchend}
    on:contextmenu|preventDefault={on_contextmenu}
    class={$cursor}
    bind:this={canvas_svg_element}
    style:--min-width="{$required_size.width}px"
    style:--min-height="{$required_size.height}px"
    style:--width="{$size.width - 8}px"
    style:--height="{$size.height - 16}px"
    >
    {#each $widgets as widget(widget.id)}
      <Node {widget} />
    {/each}
    {#each $connections as connection}
      <Noodle {connection} />
    {/each}
  </svg>
</div>

<style lang="scss">
  .wrap {
    width: 100%;
    height: 100%;
    overflow: auto;
    /* border: #0f0 solid thin; */
    box-sizing: border-box;
  }

  .debug {
    position: absolute;
    border: #00f solid thin;
    display: inline-block;
    visibility: hidden;
  }

  svg {
    /* width: 100%;
    height: 100%; */
    /* border: #f0f solid thick; */
    box-sizing: border-box;
    width: var(--width);
    height: var(--height);
    min-width: var(--min-width);
    min-height: var(--min-height);
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
      cursor: cell;
    }

    &.editmode_disconnect {
      cursor: crosshair;
    }
  }
</style>