<script lang="ts">
  import { onMount } from 'svelte'
  
  import type { PdWidget, TextSelection } from '$lib/pd/pd_widget'

  export let widget: PdWidget

  type Cell = {
    idx_in_string: number
    idx_in_row: number
    char: string
  }
  
  type Cursor = {
    x: number
    y: number
  }

  type Row = {
    idx: number
    cells: Cell[]
  }

  function cellify_text(t: string) {
    let rows: Row[] = []
    const lines = t.split('\n')
    let row_idx = 0
    let cell_idx = 0
    lines.forEach(line => {
      const cells: Cell[] = []
      const row = {idx: row_idx++, cells}
      for(let idx = 0; idx < line.length; ++idx) {
        row.cells.push({idx_in_string: cell_idx++, idx_in_row: idx, char: line.charAt(idx)})
      }
      rows.push(row)
    })
    return rows
  }

  function update_cursor(text: string, selection: TextSelection) : Cursor {
/*     console.log(text)
    console.log(selection) */
    if (text.length == 0) {
      return {x: 0, y: 0}
    }

    if (selection.start == text.length) {
      const last_row = rows[rows.length - 1]
      const last_cell = last_row.cells[last_row.cells.length - 1]
      return {x: last_cell.idx_in_row + 1, y: rows.length - 1}
    }
    for (let row_idx = 0; row_idx < rows.length; ++row_idx) {
      const row = rows[row_idx]
      for(let cell_idx = 0; cell_idx < row.cells.length; ++cell_idx) {
        const cell = row.cells[cell_idx]
        if (cell.idx_in_string == selection.start) {
          return {x: cell.idx_in_row, y: row_idx}
        }
      }
    }
    return {x: 0, y: 0}
  }
 
  $: state = widget.state
  $: text = widget.text
  $: fontsize = widget.fontsize
  $: selection = widget.text_selection
  $: rows = cellify_text($text)
  $: cursor = update_cursor($text, $selection)

</script>

<!-- <text>{$fontsize}</text> -->
{#each rows as row}
  {#each row.cells as cell}
    {#if $selection.start <= cell.idx_in_string && $selection.end > cell.idx_in_string}
      <rect x={cell.idx_in_row * $fontsize / 1.8} y={row.idx  * $fontsize } width={$fontsize / 1.8 + 1} height={$fontsize + 4} class="bg" />
    {/if}
    <text x={cell.idx_in_row * $fontsize / 1.8} y={(row.idx + 1) * $fontsize + 1} 
      style:--fontsize="{$fontsize}px"
      class:selected={$selection.start <= cell.idx_in_string && $selection.end > cell.idx_in_string}>
      {cell.char}
    </text>
  {/each}
{/each}

{#if $state == 'edit'}
  <line x1={cursor.x * $fontsize / 1.8} x2={cursor.x * $fontsize / 1.8} y1={cursor.y * 12} y2={cursor.y * 12 + 16} class="cursor" />
{/if}

<style lang="scss">
  text {
    user-select: none;
    font-family: 'DejaVu Sans Mono', 'Courier New', Courier, monospace;
    font-size: var(--fontsize);
    &.selected {
      fill: #def;
    }
  }

  rect.bg {
    fill: rgb(131, 133, 153);
  }

  line.cursor {
    shape-rendering: crispEdges;
    stroke: #000;
    stroke-width: 0.8;
    animation: blink 1s infinite;
    animation-timing-function: steps(1,3);
  }

  @keyframes blink {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
</style>