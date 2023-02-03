import { describe, it, expect } from 'vitest'

import type { TokenType, Token } from './tokens'
import { TokenStream } from './token_stream'
import { MockLexer } from './mock_lexer'
import { Parser, type Ok } from './parser'
import { Identifier, NumberNode, StringNode, VectorNode } from './syntax_nodes'

describe('Parse identifier', () => {
  it('parses simple identifier', () => {
    const expected_id = 'set'
    const tokens: Token[] = [
      {type: 'Identifier', lexeme: expected_id}
    ]
    const ts = new TokenStream( new MockLexer(tokens) )
    const p = new Parser(ts)
    const id = p.parse_identifier()
    expect(id.name).toBe(expected_id)
    const ns = id.namespace
    expect(ns).toEqual({name: '', namespace: null})
  })

  it('parses globally namespaced identifier', () => {
    const expected_id = 'sys_searchpath'
    const tokens: Token[] = [
      {type: 'ColonColon'},
      {type: 'Identifier', lexeme: 'sys_searchpath'}
    ]
    const ts = new TokenStream( new MockLexer(tokens) )
    const p = new Parser(ts)
    const id = p.parse_identifier()
    expect(id.name).toBe(expected_id)
    const ns = id.namespace
    expect(ns).toEqual({name: '', namespace: null})
  })

  // ::deken::set_platform
  it('parses singly-nested-namespaced identifier', () => {
    const expected_id = 'set_platform'
    const expected_ns_id = 'deken'
    const tokens: Token[] = [
      {type: 'ColonColon'},
      {type: 'Identifier', lexeme: expected_ns_id},
      {type: 'ColonColon'},
      {type: 'Identifier', lexeme: expected_id}
    ]
    const ts = new TokenStream( new MockLexer(tokens) )
    const p = new Parser(ts)
    const id = p.parse_identifier()
    expect(id.name).toBe(expected_id)
    const ns = id.namespace!
    expect(ns.name).toBe('deken')
  })

  // ::pd::canvas::set_zoom
  it('parses doubly-nested-namespaced identifier', () => {
    const expected_id = 'set_zoom'
    const expected_ns_id = 'canvas'
    const expected_top_ns_id = 'pd'
    const tokens: Token[] = [
      {type: 'ColonColon'},
      {type: 'Identifier', lexeme: expected_top_ns_id},
      {type: 'ColonColon'},
      {type: 'Identifier', lexeme: expected_ns_id},
      {type: 'ColonColon'},
      {type: 'Identifier', lexeme: expected_id}
    ]
    const ts = new TokenStream( new MockLexer(tokens) )
    const p = new Parser(ts)
    const id = p.parse_identifier()
    expect(id.name).toBe(expected_id)
    const parent_ns = id.namespace!
    expect(parent_ns.name).toBe(expected_ns_id)
    const top_ns = parent_ns.namespace!
    expect(top_ns.name).toBe(expected_top_ns_id)
  })
})

describe('Parse property', () => {
  it('parses property with number value', () => {
    const expected_id = 'propertyname'
    const tokens: Token[] = [
      {type: 'Minus'},
      {type: 'Identifier', lexeme: expected_id},
      {type: 'IntegerLiteral', lexeme: "0"}
    ]
    const ts = new TokenStream( new MockLexer(tokens) )
    const p = new Parser(ts)
    const property = p.parse_property()
    expect(property.key.name).toBe(expected_id)
    expect(property.value).toBeInstanceOf(NumberNode)
  })

  it('parses property with empty vector value', () => {
    const expected_id = 'propertyname'
    const tokens: Token[] = [
      {type: 'Minus'},
      {type: 'Identifier', lexeme: expected_id},
      {type: 'BraceLeft'},
      {type: 'BraceRight'}
    ]
    const ts = new TokenStream( new MockLexer(tokens) )
    const p = new Parser(ts)
    const property = p.parse_property()
    expect(property.key.name).toBe(expected_id)
    expect(property.value).toBeInstanceOf(VectorNode)
  })


  it('parses color property', () => {
    const expected_id = 'lcolor'
    const color = '#aabbcc'
    const tokens: Token[] = [
      {type: 'Minus'},
      {type: 'Identifier', lexeme: expected_id},
      {type: 'ColorLiteral', lexeme: color},
      {type: 'BraceLeft'},
      {type: 'BraceRight'}
    ]
    const ts = new TokenStream( new MockLexer(tokens) )
    const p = new Parser(ts)
    const property = p.parse_property()
    expect(property.key.name).toBe(expected_id)
    expect(property.value).toBeInstanceOf(StringNode)
    const color_value = property.value as StringNode
    expect(color_value.type_annotation).toBe('ColorLiteral')
    expect(color_value.value).toBe(color)
  })

  it('parses property with vector containing one integer', () => {
    const expected_id = 'propertyname'
    const tokens: Token[] = [
      {type: 'Minus'},
      {type: 'Identifier', lexeme: expected_id},
      {type: 'BraceLeft'},
      {type: 'IntegerLiteral', lexeme: '1'},
      {type: 'BraceRight'}
    ]
    const ts = new TokenStream( new MockLexer(tokens) )
    const p = new Parser(ts)
    const property = p.parse_property()
    expect(property.key.name).toBe(expected_id)
    expect(property.value).toBeInstanceOf(VectorNode)
    const vec = property.value as VectorNode
    expect(vec.elements.length).toBe(1)
    const number_element = vec.elements[0] as NumberNode
    expect(number_element.value).toBe("1")
  })

  it('parses property with vector containing two floats', () => {
    const expected_id = 'propertyname'
    const tokens: Token[] = [
      {type: 'Minus'},
      {type: 'Identifier', lexeme: expected_id},
      {type: 'BraceLeft'},
      {type: 'FPLiteral', lexeme: '0.0000'},
      {type: 'FPLiteral', lexeme: '1.1111'},
      {type: 'BraceRight'}
    ]
    const ts = new TokenStream( new MockLexer(tokens) )
    const p = new Parser(ts)
    const property = p.parse_property()
    expect(property.key.name).toBe(expected_id)
    expect(property.value).toBeInstanceOf(VectorNode)
    const vec = property.value as VectorNode
    expect(vec.elements.length).toBe(2)
    const first_element = vec.elements[0] as NumberNode
    expect(first_element.value).toBe("0.0000")
    const second_element = vec.elements[1] as NumberNode
    expect(second_element.value).toBe("1.1111")
  })

  it('parses property with vector containing four floats', () => {
    const expected_id = 'propertyname'
    const tokens: Token[] = [
      {type: 'Minus'},
      {type: 'Identifier', lexeme: expected_id},
      {type: 'BraceLeft'},
      {type: 'FPLiteral', lexeme: '0.0000'},
      {type: 'FPLiteral', lexeme: '1.1111'},
      {type: 'FPLiteral', lexeme: '2.2222'},
      {type: 'FPLiteral', lexeme: '3.3333'},
      {type: 'BraceRight'}
    ]
    const ts = new TokenStream( new MockLexer(tokens) )
    const p = new Parser(ts)
    const property = p.parse_property()
    expect(property.key.name).toBe(expected_id)
    expect(property.value).toBeInstanceOf(VectorNode)
    const vec = property.value as VectorNode
    expect(vec.elements.length).toBe(4)
    const element_0 = vec.elements[0] as NumberNode
    expect(element_0.value).toBe("0.0000")
    const element_1 = vec.elements[1] as NumberNode
    expect(element_1.value).toBe("1.1111")
    const element_2 = vec.elements[2] as NumberNode
    expect(element_2.value).toBe("2.2222")
    const element_3 = vec.elements[3] as NumberNode
    expect(element_3.value).toBe("3.3333")
  })  
})

describe('Parse vector', () => {
  it('parses empty vector', () => {
    const tokens: Token[] = [
      {type: 'BraceLeft'},
      {type: 'BraceRight'}
    ]
    const ts = new TokenStream( new MockLexer(tokens) )
    const p = new Parser(ts)
    const v = p.parse_vector()
    expect(v.elements.length).toBe(0)
  })

  it('parses vector with one integer value', () => {
    const tokens: Token[] = [
      {type: 'BraceLeft'},
      {type: 'IntegerLiteral', lexeme: '0'},
      {type: 'BraceRight'}
    ]
    const ts = new TokenStream( new MockLexer(tokens) )
    const p = new Parser(ts)
    const v = p.parse_vector()
    expect(v.elements.length).toBe(1)
  })

  it('parses vector with one fp value', () => {
    const tokens: Token[] = [
      {type: 'BraceLeft'},
      {type: 'FPLiteral', lexeme: '0.0'},
      {type: 'BraceRight'}
    ]
    const ts = new TokenStream( new MockLexer(tokens) )
    const p = new Parser(ts)
    const v = p.parse_vector()
    expect(v.elements.length).toBe(1)
  })

  it('parses vector with many fp values', () => {
    const tokens: Token[] = [
      {type: 'BraceLeft'},
      {type: 'FPLiteral', lexeme: '0.0'},
      {type: 'FPLiteral', lexeme: '1.1'},
      {type: 'FPLiteral', lexeme: '2.2'},
      {type: 'FPLiteral', lexeme: '3.3'},
      {type: 'BraceRight'}
    ]
    const ts = new TokenStream( new MockLexer(tokens) )
    const p = new Parser(ts)
    const v = p.parse_vector()
    expect(v.elements.length).toBe(4)
  })

  it('parses vector with negative fp values', () => {
    const tokens: Token[] = [
      {type: 'BraceLeft'},
      {type: 'FPLiteral', lexeme: '-123.0'},
      {type: 'FPLiteral', lexeme: '-456.0'},
      {type: 'BraceRight'}
    ]
    const ts = new TokenStream( new MockLexer(tokens) )
    const p = new Parser(ts)
    const v = p.parse_vector()
    expect(v.elements.length).toBe(2)
  })

  it('parses vector with string', () => {
    const tokens: Token[] = [
      {type: 'BraceLeft'},
      {type: 'Identifier', lexeme: 'message'},
      {type: 'BraceRight'}
    ]
    const ts = new TokenStream( new MockLexer(tokens) )
    const p = new Parser(ts)
    const v = p.parse_vector()
    expect(v.elements.length).toBe(1)
    const s = v.elements[0] as StringNode
    expect(s.value).toBe("message")
  })

  it('parses vector with strings', () => {
    const tokens: Token[] = [
      {type: 'BraceLeft'},
      {type: 'Identifier', lexeme: 'no'},
      {type: 'Identifier', lexeme: 'such'},
      {type: 'Identifier', lexeme: 'object'},
      {type: 'BraceRight'}
    ]
    const ts = new TokenStream( new MockLexer(tokens) )
    const p = new Parser(ts)
    const v = p.parse_vector()
    expect(v.elements.length).toBe(3)
    const s0 = v.elements[0] as StringNode
    expect(s0.value).toBe("no")
    const s1 = v.elements[1] as StringNode
    expect(s1.value).toBe("such")
    const s2 = v.elements[2] as StringNode
    expect(s2.value).toBe("object")
  })
})

describe('Parse unnamespaced, unterminated with 0 args', () => {
  it('parses pdtk_watchdog', () => {
    const proc_name = 'pdtk_watchdog'
    const tokens: Token[] = [
      {type: 'Identifier', lexeme: proc_name}
    ]
    const ts = new TokenStream( new MockLexer(tokens) )
    const p = new Parser(ts)
    const proc = p.parse_procedure()!
    expect(proc.arguments.length).toBe(0)
    expect(proc.id.name).toBe(proc_name)
  })
})


describe('Parse unnamespaced, unterminated procedure with two arguments', () => {
  it('parses set zoom_open', () => {
    const proc_name = 'set'
    const identifier = 'zoom_open'
    const value = "0"
    const tokens: Token[] = [
      {type: 'Identifier', lexeme: proc_name},
      {type: 'Identifier', lexeme: identifier},
      {type: 'IntegerLiteral', lexeme: `${value}`}
    ]
    const ts = new TokenStream( new MockLexer(tokens) )
    const p = new Parser(ts)
    const proc = p.parse_procedure()!
    expect(proc.arguments.length).toBe(2)
    expect(proc.id.name).toBe(proc_name)
    const first_arg = proc.arguments[0]
    expect(first_arg).toBeInstanceOf(Identifier)
    const id = first_arg as Identifier
    expect(id.name).toBe(identifier)
    const second_arg = proc.arguments[1]
    expect(second_arg).toBeInstanceOf(NumberNode)
    const integer = second_arg as NumberNode
    expect(integer.value).toBe(value)
  })

  it('parses set pd_whichmidiapi', () => {
    const proc_name = 'set'
    const identifier = 'pd_whichmidiapi'
    const value = "0"
    const tokens: Token[] = [
      {type: 'Identifier', lexeme: proc_name},
      {type: 'Identifier', lexeme: identifier},
      {type: 'IntegerLiteral', lexeme: `${value}`}
    ]
    const ts = new TokenStream( new MockLexer(tokens) )
    const p = new Parser(ts)
    const proc = p.parse_procedure()!
    expect(proc.arguments.length).toBe(2)
    expect(proc.id.name).toBe(proc_name)
    const first_arg = proc.arguments[0]
    expect(first_arg).toBeInstanceOf(Identifier)
    const id = first_arg as Identifier
    expect(id.name).toBe(identifier)
    const second_arg = proc.arguments[1]
    expect(second_arg).toBeInstanceOf(NumberNode)
    const integer = second_arg as NumberNode
    expect(integer.value).toBe(value)
  })
})

describe('Parse unnamespaced, unterminated procedure with identifier argument', () => {
  it('parses pdtk_canvas_getscroll .x2221af0.c', () => {
    const proc_name = 'pdtk_canvas_getscroll'
    const identifier = '.x2221af0.c'
    const tokens: Token[] = [
      {type: 'Identifier', lexeme: proc_name},
      {type: 'Identifier', lexeme: identifier},
    ]
    const ts = new TokenStream( new MockLexer(tokens) )
    const p = new Parser(ts)
    const proc = p.parse_procedure()!
    expect(proc.arguments.length).toBe(1)
    expect(proc.id.name).toBe(proc_name)
    const arg = proc.arguments[0]
    expect(arg).toBeInstanceOf(Identifier)
    const id = arg as Identifier
    expect(id.name).toBe(identifier)
  })
})


describe('Parse namespaced procedure with identifier argument', () => {
  it('parses ::pdwidget::destroy 0x21ff820', () => {
    const proc_name = 'destroy'
    const identifier = '0x21ff820'
    const tokens: Token[] = [
      {type: 'ColonColon'},
      {type: 'Identifier', lexeme: 'pdwidget'},
      {type: 'ColonColon'},
      {type: 'Identifier', lexeme: proc_name},
      {type: 'Identifier', lexeme: identifier},
    ]
    const ts = new TokenStream( new MockLexer(tokens) )
    const p = new Parser(ts)
    const proc = p.parse_procedure()!
    expect(proc.arguments.length).toBe(1)
    expect(proc.id.name).toBe(proc_name)
    const arg = proc.arguments[0]
    expect(arg).toBeInstanceOf(Identifier)
    const id = arg as Identifier
    expect(id.name).toBe(identifier)
  })
})


describe('Parse procedure with vector argument', () => {
  it('parses set ::sys_temppath {}', () => {
    const proc_name = 'set'
    const identifier = 'sys_temppath'
    const tokens: Token[] = [
      {type: 'Identifier', lexeme: proc_name},
      {type: 'ColonColon'},
      {type: 'Identifier', lexeme: 'sys_temppath'},
      {type: 'BraceLeft'},
      {type: 'BraceRight'},
    ]
    const ts = new TokenStream( new MockLexer(tokens) )
    const p = new Parser(ts)
    const proc = p.parse_procedure()!
    expect(proc.arguments.length).toBe(2)
    expect(proc.id.name).toBe(proc_name)
    const first_arg = proc.arguments[0]
    expect(first_arg).toBeInstanceOf(Identifier)
    const id = first_arg as Identifier
    expect(id.name).toBe(identifier)
    const second_arg = proc.arguments[1]
    expect(second_arg).toBeInstanceOf(VectorNode)
    const vec = second_arg as VectorNode
    expect(vec.elements.length).toBe(0)
  })
})



describe('Parse simple messages', () => {
  it('parses pdtk_watchdog', () => {
    const proc_name = 'pdtk_watchdog'
    const tokens: Token[] = [
      {type: 'Identifier', lexeme: proc_name}
    ]
    const ts = new TokenStream( new MockLexer(tokens) )
    const p = new Parser(ts)
    const result = p.parse()
    expect(result.kind).toBe('ok')
    const ok_result = result as Ok
    expect(ok_result.root.procs.length).toBe(1)

    // expect(proc.arguments.length).toBe(2)
    // expect(proc.id.name).toBe(proc_name)
    // const first_arg = proc.arguments[0]
    // expect(first_arg).toBeInstanceOf(Identifier)
    // const id = first_arg as Identifier
    // expect(id.name).toBe(identifier)
    // const second_arg = proc.arguments[1]
    // expect(second_arg).toBeInstanceOf(VectorNode)
    // const vec = second_arg as VectorNode
    // expect(vec.elements.length).toBe(0)
  })
})