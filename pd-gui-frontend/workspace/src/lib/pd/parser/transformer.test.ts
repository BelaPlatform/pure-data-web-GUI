import { describe, it, expect } from 'vitest'

import { transform } from "./transformer"
import { Identifier, NumberNode, Procedure, RootNode } from './syntax_nodes'
import * as Commands from './commands/command'
import * as PdCommands from './commands/pd_commands'
import * as CanvasCommands from './commands/canvas_commands'
import * as WidgetCommands from './commands/widget_commands'

describe('transform simple commands', () => {
  it('returns UnrecognizedCommand for bogus input', () => {
    const id = new Identifier('unknnown-procedure-name')
    const proc = new Procedure(id)
    const root = new RootNode()
    root.procs.push(proc)
    const commands = transform(root)
    expect(commands.length).toBe(1)
    const command = commands[0] 
    expect(command).toBeInstanceOf(Commands.UnrecognizedCommand)
  })

  it('transforms pdtk_watchdog', () => {
    const id = new Identifier('pdtk_watchdog')
    const proc = new Procedure(id)
    const root = new RootNode()
    root.procs.push(proc)
    const commands = transform(root)
    expect(commands.length).toBe(1)
    const command = commands[0] 
    expect(command).toBeInstanceOf(PdCommands.Watchdog)
  })
})


describe('transform canvas procs with one arg', () => {
  it('transforms pdtk_canvas_getscroll', () => {
    const canvas_id = '.x2221af0.c'
    const id = new Identifier('pdtk_canvas_getscroll')
    const proc = new Procedure(id)
    const arg = new Identifier(canvas_id)
    proc.arguments.push(arg)
    const root = new RootNode()
    root.procs.push(proc)
    const commands = transform(root)
    expect(commands.length).toBe(1)
    const command = commands[0] 
    expect(command).toBeInstanceOf(CanvasCommands.GetScroll)
    const get_scroll_command = command as CanvasCommands.GetScroll
    expect(get_scroll_command.canvas_id).toBe(canvas_id)
  })
})

describe('transform canvas procs with one arg', () => {
  it('transforms pdtk_canvas_new', () => {
    const canvas_id = '.x2221af0.c'
    const id = new Identifier('pdtk_canvas_new')
    const proc = new Procedure(id)
    const arg = new Identifier(canvas_id)
    proc.arguments.push(arg)
    const root = new RootNode()
    root.procs.push(proc)
    const commands = transform(root)
    expect(commands.length).toBe(1)
    const command = commands[0] 
    expect(command).toBeInstanceOf(CanvasCommands.NewCanvas)
    const get_scroll_command = command as CanvasCommands.NewCanvas
    expect(get_scroll_command.canvas_id).toBe(canvas_id)
  })
})


describe('transform canvas procs with many args', () => {
  it('transforms ::pd::canvas::set_cursor .x2221af0.c runmode_nothing', () => {
    const canvas_id = '.x2221af0.c'
    const cleaned_canvas_id = canvas_id.split('.c')[0]
    const cursor = 'runmode_nothing'
    const id = new Identifier('set_cursor')
    const proc = new Procedure(id)
    const canvas_arg = new Identifier(canvas_id)
    const cursor_arg = new Identifier(cursor)
    proc.arguments.push(canvas_arg)
    proc.arguments.push(cursor_arg)
    const root = new RootNode()
    root.procs.push(proc)
    const commands = transform(root)
    expect(commands.length).toBe(1)
    const command = commands[0] 
    expect(command).toBeInstanceOf(CanvasCommands.SetCursor)
    const get_scroll_command = command as CanvasCommands.SetCursor
    expect(get_scroll_command.canvas_id).toBe(cleaned_canvas_id)
    expect(get_scroll_command.cursor).toBe(cursor)
  })

  it('transforms ::pd::canvas::set_zoom .x2221af0.c 1', () => {
    const canvas_id = '.x2221af0.c'
    const cleaned_canvas_id = canvas_id.split('.c')[0]
    const value = 1
    const id = new Identifier('set_zoom')
    const proc = new Procedure(id)
    const canvas_arg = new Identifier(canvas_id)
    const value_arg = new NumberNode(`${value}`, 'IntegerLiteral')
    proc.arguments.push(canvas_arg)
    proc.arguments.push(value_arg)
    const root = new RootNode()
    root.procs.push(proc)
    const commands = transform(root)
    expect(commands.length).toBe(1)
    const command = commands[0] 
    expect(command).toBeInstanceOf(CanvasCommands.SetZoom)
    const get_scroll_command = command as CanvasCommands.SetZoom
    expect(get_scroll_command.canvas_id).toBe(cleaned_canvas_id)
    expect(get_scroll_command.value).toBe(value)
  })

  it('transforms pdtk_canvas_setparents .x2221af0 {} ;', () => {
    const canvas_id = '.x2221af0.c'
    const value = 1
    const id = new Identifier('pdtk_canvas_setparents')
    const proc = new Procedure(id)
    const canvas_arg = new Identifier(canvas_id)
    const value_arg = new NumberNode(`${value}`, 'IntegerLiteral')
    proc.arguments.push(canvas_arg)
    const root = new RootNode()
    root.procs.push(proc)
    const commands = transform(root)
    expect(commands.length).toBe(1)
    const command = commands[0] 
    expect(command).toBeInstanceOf(CanvasCommands.SetParents)
    const set_parents_command = command as CanvasCommands.SetParents
    expect(set_parents_command.canvas_id).toBe(canvas_id)
  })
})

describe('transform widget procs', () => {
  it('transforms "::pdwidget::create bang 0x15f65b0 .x15f5c90.c 54 30 ;"', () => {
    const klass = 'bang'
    const widget_id = '0x15f65b0'
    const canvas_id = '.x2221af0.c'
    const cleaned_canvas_id = canvas_id.split('.c')[0]
    const origin_x = 54
    const origin_y = 30
    const id = new Identifier('create')
    const proc = new Procedure(id)
    const klass_arg = new Identifier(klass)
    const widget_id_arg = new Identifier(widget_id)
    const canvas_arg = new Identifier(canvas_id)
    const origin_x_arg = new NumberNode(`${origin_x}`, 'IntegerLiteral')
    const origin_y_arg = new NumberNode(`${origin_y}`, 'IntegerLiteral')
    proc.arguments.push(klass_arg)
    proc.arguments.push(widget_id_arg)
    proc.arguments.push(canvas_arg)
    proc.arguments.push(origin_x_arg)
    proc.arguments.push(origin_y_arg)
    const root = new RootNode()
    root.procs.push(proc)
    const commands = transform(root)
    expect(commands.length).toBe(1)
    const command = commands[0] 
    expect(command).toBeInstanceOf(WidgetCommands.Create)
    const create_command = command as WidgetCommands.Create
    expect(create_command.klass).toBe(klass)
    expect(create_command.widget_id).toBe(widget_id)
    expect(create_command.canvas_id).toBe(cleaned_canvas_id)
    expect(create_command.origin_x).toBe(origin_x)
    expect(create_command.origin_y).toBe(origin_y)
  })
})