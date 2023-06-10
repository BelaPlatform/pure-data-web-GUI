<script lang="ts">
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
    range_start: number
    range_end: number
  }

  function cellify_text(t: string) {
    let rows: Row[] = []
    const lines = t.split('\n')
    console.log(`cellify_text: ${t} ${lines.length} lines`)
    let row_idx = 0
    let cell_idx = 0
    lines.forEach(line => {
      const cells: Cell[] = []
      const range_start = cell_idx
      const range_end = cell_idx + line.length
      const row = {idx: row_idx++, cells, range_start, range_end}
      for(let idx = 0; idx < line.length; ++idx) {
        row.cells.push({idx_in_string: cell_idx++, idx_in_row: idx, char: line.charAt(idx)})
      }
      rows.push(row)
      cell_idx++
    })
    return rows
  }

  function update_cursor(text: string, selection: TextSelection) : Cursor {
    if (text.length == 0) {
      return {x: 0, y: 0}
    }

    for (let row_idx = 0; row_idx < rows.length; ++row_idx) {
      const row = rows[row_idx]
      if (row.range_start <= selection.start && row.range_end >= selection.start) {
        for(let cell_idx = 0; cell_idx < row.cells.length; ++cell_idx) {
          const cell = row.cells[cell_idx]
          if (cell.idx_in_string == selection.start) {
            return {x: cell.idx_in_row, y: row_idx}
          }
        }
        return {x: row.range_end - row.range_start, y: row_idx}
      }
    }

    return {x: 0, y: rows.length}
  }
 
  $: state = widget.state
  $: text = widget.text
  $: fontsize = widget.fontsize
  $: selection = widget.text_selection
  $: rows = cellify_text($text)
  $: cursor = update_cursor($text, $selection)

</script>

{#if $state == 'edit'}
  <line x1={cursor.x * $fontsize / 1.8} x2={cursor.x * $fontsize / 1.8} y1={cursor.y * ($fontsize + 3) + 2} y2={cursor.y * ($fontsize + 3) + 18} class="cursor" />
  {#each rows as row}
    {#each row.cells as cell}
      {#if $selection.start <= cell.idx_in_string && $selection.end > cell.idx_in_string}
        <rect x={cell.idx_in_row * $fontsize / 1.8} y={row.idx * ($fontsize + 3)} width={$fontsize / 1.8 + 1} height={$fontsize + 7} class="bg" />
      {/if}
      <text x={cell.idx_in_row * $fontsize / 1.8} y={(row.idx + 1) * ($fontsize + 3)} 
        style:--fontsize="{$fontsize}px"
        class:selected={$selection.start <= cell.idx_in_string && $selection.end > cell.idx_in_string}>
        {cell.char}
      </text>
    {/each}
  {/each}
{:else}
  <!-- TODO: calculate text extent -->
  <foreignObject x="0" y="0" width="600" height="480">
    <div>
      {$text}
    </div>
  </foreignObject>
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

  div {
    font-family: 'DejaVu Sans Mono', 'Courier New', Courier, monospace;
    font-size: 12px;
    width: 100%;
    height: 100%;
    overflow: hidden;
    white-space: pre-wrap;
    word-wrap: break-word;
    padding-top: 3px;
    letter-spacing: -1px;
  }

</style>