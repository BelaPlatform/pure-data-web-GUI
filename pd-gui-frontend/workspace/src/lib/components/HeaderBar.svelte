<script lang="ts">
  import { get } from 'svelte/store'
  import OutClick from 'svelte-outclick'

  import { wm } from '$lib/stores/wm'
  import { menu, type MenuItem } from '$lib/stores/menu'

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

  <button
    on:click={_ => $wm.new_window()}
    on:keydown={_ => $wm.new_window()}>
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