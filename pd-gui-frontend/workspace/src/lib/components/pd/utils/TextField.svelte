<script lang="ts">
  import { onMount } from 'svelte'
  
  import type { PdWidget } from '$lib/pd/pd_widget'

  export let widget: PdWidget

  $: state = widget.state
  $: text = widget.text
  $: fontsize = widget.fontsize
  $: selection = widget.text_selection

  type Cell = {
    idx_in_string: number
    idx_in_row: number
    char: string
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

  let rows: Row[] = []
  let cursor: {x: number, y: number} = {x: 0, y: 0}
  onMount(() => {
    text.subscribe(t => {
      rows = cellify_text(t)
      console.log(rows)
    })
    selection.subscribe(s => {
      if ($text.length == 0) {
        cursor = {x: 0, y: 0}
        return
      }
      if (s.start == $text.length) {
        const last_row = rows[rows.length - 1]
        const last_cell = last_row.cells[last_row.cells.length - 1]
        cursor = {x: last_cell.idx_in_row + 1, y: rows.length - 1}
        return
      }
      for (let row_idx = 0; row_idx < rows.length; ++row_idx) {
        const row = rows[row_idx]
        for(let cell_idx = 0; cell_idx < row.cells.length; ++cell_idx) {
          const cell = row.cells[cell_idx]
          if (cell.idx_in_string == s.start) {
            cursor = {x: cell.idx_in_row, y: row_idx}
            return
          }
        }
      }

    })
  })

</script>

{#each rows as row}
  {#each row.cells as cell}
    {#if $selection.start <= cell.idx_in_string && $selection.end > cell.idx_in_string}
      <rect x={cell.idx_in_row * 8} y={row.idx * 12} width="8" height="14" class="bg" />
    {/if}
    <text x={cell.idx_in_row * 8} y={12 + row.idx * 12} 
      style:--fontsize="{$fontsize}px"
      class:selected={$selection.start <= cell.idx_in_string && $selection.end > cell.idx_in_string}>
      {cell.char}
    </text>
  {/each}
{/each}

{#if $state == 'edit'}
  <line x1={cursor.x * 8} x2={cursor.x * 8} y1={cursor.y * 12} y2={cursor.y * 12 +16} class="cursor" />
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
    width: 2px;
    stroke: #000;
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