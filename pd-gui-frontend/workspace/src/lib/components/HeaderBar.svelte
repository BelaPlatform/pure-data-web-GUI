<script lang="ts">
  import { get } from 'svelte/store'
  import OutClick from 'svelte-outclick'

  import { wm } from '$lib/stores/wm'
  import { available_patches } from '$lib/stores/patches'

  type MenuItem = {
    title: string
    children?: MenuItem[]
  }

  function build_file_menu() : MenuItem[] {
    const pre = [
      {title: 'New'},
      {title: 'Open'},
      {title: 'Save'},
      {title: 'SaveAs'},
      {title: 'Message'},
      {title: 'Preferences'}
    ]
    const post = [
      {title: 'Print'},
      {title: 'Close'},
      {title: 'Quit'}
    ]
    
    const recent: MenuItem[] = []
    get(available_patches).forEach(item => {
      const path_components = item.file.split('/')
      const filename = path_components[path_components.length - 1]
      recent.push({title: `${item.id}. ${filename}`})
    })
    return pre.concat(recent).concat(post)
  }

  let file_menu: MenuItem[] = build_file_menu()

  let edit_menu: MenuItem[] = [
    {title: 'Undo'},
    {title: 'Redo'},
    {title: 'Cut'},
    {title: 'Copy'},
    {title: 'Paste'},
    {title: 'SelectAll'}
  ]

  let put_menu: MenuItem[] = [
    {title: 'Object'},
    {title: 'Message'},
    {title: 'Number'},
    {title: '...'}
  ]

  let find_menu: MenuItem[] = [
    {title: 'Find'},
    {title: 'Find Again'},
    {title: 'Find Last Error'}
  ]

  let media_menu: MenuItem[] = [
    {title: 'DSP On'},
    {title: 'DSP Off'},
    {title: 'Test Audio and Midi...'},
    {title: '...'}
  ]

  let help_menu: MenuItem[] = [
    {title: 'About Pd'},
    {title: 'HTML Manual...'},
    {title: 'Browser...'},
    {title: 'List of Objects...'},
    {title: '...'}
  ]

  let menu: MenuItem[] = [
    {title: 'File', children: file_menu},
    {title: 'Edit', children: edit_menu},
    {title: 'Put', children: put_menu},
    {title: 'Find', children: find_menu},
    {title: 'Media', children: media_menu},
    // {title: 'Window'},
    {title: 'Help', children: help_menu},
  ]

  let second_level: MenuItem | null = null

  function on_open_menu(item: MenuItem) {
    second_level = item
  }

  function on_hover(item: MenuItem) {
    if (second_level) {
      second_level = item
    }
  }

  function on_dismiss_menu() {
    second_level = null
  }
</script>

<div class="wrap">
  <ul class="top_level">
    {#each menu as item}
      <li
        on:click={_ => on_open_menu(item)}
        on:keydown={_ => on_open_menu(item)}
        on:mouseenter={_ => on_hover(item)}
        class:is_open={second_level == item}
        >
        <span class="title">{item.title}</span>
        {#if second_level == item && second_level.children}
          <OutClick on:outclick={on_dismiss_menu}>
          <ul class="second_level">
            {#each second_level.children as item}
              <li
                on:click={_ => on_open_menu(item)}
                on:keydown={_ => on_open_menu(item)}
                >
                <span class="title">{item.title}</span>
              </li>
            {/each}
          </ul>
          </OutClick>
        {/if}
      </li>
    {/each}
  </ul>

  <button on:click={$wm.new_window()}>
    +
  </button>
</div>

<style lang="scss">
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    font-family: monospace;
    user-select: none;
    background-color: #ddd;
  }

  li {
    padding: 6px;
    &:hover, &.is_open {
      background-color: #eee;
    }
  }

  span.title {
    padding: 6px;
  }

  ul.top_level {
    li {
      &:hover {
        background-color: #eee;
      }
    }
  }

  ul.second_level {
    border-top: #ccc solid thin;
    min-width: 144px;
    flex-direction: column;
    position: absolute;
    margin-left: -6px;
    margin-top: 6px;
  }
</style>