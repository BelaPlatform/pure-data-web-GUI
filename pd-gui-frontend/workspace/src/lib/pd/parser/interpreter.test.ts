import { describe, it, expect } from 'vitest'

import { Pd } from '../pd'
import * as WidgetCommands from './commands/widget_commands'
import { Interpreter } from './interpreter'
import { StringNode, VectorNode } from './syntax_nodes'

class MockPd extends Pd {}

describe('Command builder for simple single commands', () => {
  const ip = new Interpreter(new MockPd())

  it('recognizes pdtk_watchdog', () => {
    const message = 'pdtk_watchdog'
    const commands = ip.build_command_vec(message)
    expect(commands.length).toBe(1)
  })
})


describe('Command builder for single commands', () => {
  const ip = new Interpreter(new MockPd())

  it('recognizes "pdtk_canvas_setparents .x2221af0 {} ;"', () => {
    const message = 'pdtk_canvas_setparents .x2221af0 {} ;'
    const commands = ip.build_command_vec(message)
    expect(commands.length).toBe(1)
  })
})


describe('bug #1', () => {
  const ip = new Interpreter(new MockPd())

  it('survives ::pdwindow::logpost', () => {
    const message = `
    ::pdwindow::logpost (nil) 1 {nil: no such object 
    } ;`
    const _ = ip.build_command_vec(message)
  })
})

describe('bug #1b', () => {
  const ip = new Interpreter(new MockPd())

  it('survives ::pdwindow::logpost', () => {
    const message = `::pdwindow::post {
} ;`
    const _ = ip.build_command_vec(message)
  })
})

describe('bug #2', () => {
  const ip = new Interpreter(new MockPd())

  it('transforms "::pdwidget::config 0x7c68a0 -size {60.000000 20.000000 } -text {subpatch} ;"', () => {
    const message = '::pdwidget::config 0x7c68a0 -size {60.000000 20.000000 } -text {subpatch} ;'
    const commands = ip.build_command_vec(message)
    expect(commands.length).toBe(1)
    expect(commands[0]).toBeInstanceOf(WidgetCommands.Config)
    const config_command = commands[0] as WidgetCommands.Config
    expect(config_command.widget_id).toBe('0x7c68a0')
    const properties = config_command.properties
    expect(properties.length).toBe(2)
    const size_property = config_command.properties[0]
    expect(size_property.key).toBe('size')
    expect(size_property.value).toBeInstanceOf(VectorNode)
    const text_property = config_command.properties[1]
    expect(text_property.key).toBe('text')
    expect(text_property.value).toBeInstanceOf(StringNode)
  })
})

describe('bug #3', () => {
  const ip = new Interpreter(new MockPd())

  it('transforms "::pdwidget::config 0x50e93d -size {-159.000000 -89.000000 } ;"', () => {
    const message = '::pdwidget::config 0x50e93d -size {-159.000000 -89.000000 } ;'
    const commands = ip.build_command_vec(message)
    expect(commands.length).toBe(1)
    expect(commands[0]).toBeInstanceOf(WidgetCommands.Config)
    const config_command = commands[0] as WidgetCommands.Config
    expect(config_command.widget_id).toBe('0x50e93d')
    const properties = config_command.properties
    expect(properties.length).toBe(1)
    const size_property = config_command.properties[0]
    expect(size_property.key).toBe('size')
    expect(size_property.value).toBeInstanceOf(VectorNode)
  })
})

describe('bug #4', () => {
  const ip = new Interpreter(new MockPd())

  it('transforms "::pdwidget::config 0x809ed0 -size {20.000000 20.000000 } -bcolor #fcfcfc -fcolor #000000 -lcolor #000000 -font {DejaVu Sans Mono} -fontsize 12 -labelpos {0.000000 -10.000000 } -label {} ;"', () => {
    const message = '::pdwidget::config 0x809ed0 -size {20.000000 20.000000 } -bcolor #fcfcfc -fcolor #000000 -lcolor #000000 -font {DejaVu Sans Mono} -fontsize 12 -labelpos {0.000000 -10.000000 } -label {} ;'
    const commands = ip.build_command_vec(message)
    expect(commands.length).toBe(1)
    expect(commands[0]).toBeInstanceOf(WidgetCommands.Config)
    const config_command = commands[0] as WidgetCommands.Config
    expect(config_command.widget_id).toBe('0x809ed0')
    const properties = config_command.properties
    expect(properties.length).toBe(8)
    const size_property = config_command.properties[0]
    expect(size_property.key).toBe('size')
    expect(size_property.value).toBeInstanceOf(VectorNode)
  })
})

describe('bug #5', () => {
  const ip = new Interpreter(new MockPd())

  it('survives "-text {- delay ....}"', () => {
    const message = '::pdwidget::config 0x2578bc0 -size {291.000000 35.000000 } -text {- delay time (float), tempo (float) and time unit (symbol) as in "tempo" message.} ;'
    const commands = ip.build_command_vec(message)
    expect(commands.length).toBe(1)
    expect(commands[0]).toBeInstanceOf(WidgetCommands.Config)
    const config_command = commands[0] as WidgetCommands.Config
    expect(config_command.widget_id).toBe('0x2578bc0')
  })
})
