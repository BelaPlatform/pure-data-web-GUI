<script lang="ts">
  import OutClick from 'svelte-outclick'

  import { app } from '$lib/stores/app'
  import type { MenuItem } from '$lib/shell/menu'

  let second_level: MenuItem | null = null

  function on_pick(item: MenuItem) {
    on_dismiss_menu()
    item.action()
  }

  function on_expand(event: MouseEvent, item: MenuItem) {
    if (item.children.length) {
     second_level = item
    }
  }

  function on_hover(item: MenuItem) {
    if (second_level) {
      second_level = item
    }
  }

  function on_dismiss_menu() {
    second_level = null
  }

  $: menu = $app.menu
</script>

<div class="wrap">
  <ul class="top_level">
    {#each $menu as item}
      <li
        on:mousedown={event => on_expand(event, item)}
        on:mouseenter={_ => on_hover(item)}
        class:is_open={second_level == item}
        >
        <span class="title">
          {item.title}
        </span>
        {#if second_level == item && second_level.children}
          <OutClick on:outclick={on_dismiss_menu}>
            <ul class="second_level">
              {#each second_level.children as item}
                <li
                  on:mousedown|stopPropagation={_ => on_pick(item)}
                  on:keydown={_ => on_pick(item)}
                  class:is_separator={item.title == '-'}
                  >
                  <span class="title">
                    {item.title}
                    {#if item.shortcut != ""}
                      <span class="shortcut">{item.shortcut}</span>
                    {/if}
                  </span>
                </li>
              {/each}
            </ul>
          </OutClick>
        {/if}
      </li>
    {/each}
  </ul>
  <aside>
    <slot></slot>
  </aside>
</div>

<style lang="scss">
  .wrap {
    display: flex;
    width: 100vw;
    background-color: #ddd;
    justify-content: space-between;
    user-select: none;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    font-family: monospace;
    background-color: #ddd;
  }

  li {
    padding: 6px;
    &:hover, &.is_open {
      background-color: #eee;
    }
  }

  span.title {
    padding: 3px;
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
    min-width: 180px;
    flex-direction: column;
    position: absolute;
    margin-left: -6px;
    margin-top: 6px;
    z-index: 99999;
    box-shadow: 2px 2px 2px #ccc;

    li.is_separator {
      height: 1px;
      background-color: #fff;
      padding: 0px;

      span { display: none; }
    }

    span.title {
      width: 100%;
      display: inline-block;

      .shortcut {
        float: right;
        padding-right: 6px;
      }
    }
  }

  aside {
    padding: 6px;
  }
</style>