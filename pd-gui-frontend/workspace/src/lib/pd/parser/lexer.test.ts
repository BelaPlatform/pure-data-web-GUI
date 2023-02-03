import { describe, it, expect } from 'vitest'

import { Lexer } from './lexer'
import type { TokenType } from './tokens'

describe('Lex punctuation', () => {
  it('returns EOF token for empty input', () => {
    const lexer = new Lexer('')
    expect(lexer.next().type).toBe('EOF')
  })

  it('returns Semicolon token for ";"', () => {
    const lexer = new Lexer(';')
    expect(lexer.next().type).toBe('Semicolon')
  })

  it('returns Newline token for "\n"', () => {
    const lexer = new Lexer('\n')
    expect(lexer.next().type).toBe('Newline')
  })

  it('returns Plus token for "+"', () => {
    const lexer = new Lexer('+')
    expect(lexer.next().type).toBe('Plus')
  })

  it('returns Minus token for "-"', () => {
    const lexer = new Lexer('-')
    expect(lexer.next().type).toBe('Minus')
  })

  it('returns BraceLeft token for "{"', () => {
    const lexer = new Lexer('{')
    expect(lexer.next().type).toBe('BraceLeft')
  })

  it('returns BraceRight token for "}"', () => {
    const lexer = new Lexer('}')
    expect(lexer.next().type).toBe('BraceRight')
  })

  it('returns ParenLeft token for "("', () => {
    const lexer = new Lexer('(')
    expect(lexer.next().type).toBe('ParenLeft')
  })

  it('returns ParenRight token for ")"', () => {
    const lexer = new Lexer(')')
    expect(lexer.next().type).toBe('ParenRight')
  })

  it('returns BracketLeft token for "["', () => {
    const lexer = new Lexer('[')
    expect(lexer.next().type).toBe('BracketLeft')
  })

  it('returns BracketRight token for "]"', () => {
    const lexer = new Lexer(']')
    expect(lexer.next().type).toBe('BracketRight')
  })

  it('returns ColonColon token for "::"', () => {
    const lexer = new Lexer('::')
    expect(lexer.next().type).toBe('ColonColon')
  })
})


describe('Lex single-digit integers', () => {
  it('returns IntegerLiteral token for "0"', () => {
    const lexer = new Lexer('0')
    expect(lexer.next()).toStrictEqual({type: 'IntegerLiteral', lexeme: '0'})
  })

  it('returns Number token for "1"', () => {
    const lexer = new Lexer('1')
    expect(lexer.next()).toStrictEqual({type: 'IntegerLiteral', lexeme: '1'})
  })
})

describe('Lex negative integers', () => {
  it('returns IntegerLiteral token for "-1"', () => {
    const lexer = new Lexer('-1')
    expect(lexer.next()).toStrictEqual({type: 'IntegerLiteral', lexeme: '-1'})
  })
})

describe('Lex negative floats', () => {
  it('returns FPLiteral token for "-0.1234"', () => {
    const lexer = new Lexer('-0.1234')
    expect(lexer.next()).toStrictEqual({type: 'FPLiteral', lexeme: '-0.1234'})
  })

  it('returns FPLiteral token for "-123.000"', () => {
    const lexer = new Lexer('-123.000')
    expect(lexer.next()).toStrictEqual({type: 'FPLiteral', lexeme: '-123.000'})
  })  
})

describe('Lex multi-digit integers', () => {
  it('returns IntegerLiteral token for "10"', () => {
    const lexer = new Lexer('10')
    expect(lexer.next()).toStrictEqual({type: 'IntegerLiteral', lexeme: '10'})
  })

  it('returns IntegerLiteral token for "1234567890"', () => {
    const lexer = new Lexer('1234567890')
    expect(lexer.next()).toStrictEqual({type: 'IntegerLiteral', lexeme: '1234567890'})
  })  
})

describe('Lex floating-point numbers', () => {
  it('returns IntegerLiteral token for "0.0"', () => {
    const lexer = new Lexer('0.0')
    expect(lexer.next()).toStrictEqual({type: 'FPLiteral', lexeme: '0.0'})
  })

  it('returns IntegerLiteral token for "1234.5678"', () => {
    const lexer = new Lexer('1234.5678')
    expect(lexer.next()).toStrictEqual({type: 'FPLiteral', lexeme: '1234.5678'})
  })
})

describe('Lex string literals', () => {
  it('returns StringLiteral token for "{hello}"', () => {
    const lexer = new Lexer('{hello}')
    expect(lexer.next()).toStrictEqual({type: 'StringLiteral', lexeme: 'hello'})
  })

  it('returns StringLiteral token for "{nil: no such object}"', () => {
    const lexer = new Lexer('{nil: no such object}')
    expect(lexer.next()).toStrictEqual({type: 'StringLiteral', lexeme: 'nil: no such object'})
  })

  it('returns StringLiteral token for string including a newline', () => {
    const message = `{nil: no such object
}`
    const lexer = new Lexer(message)
    expect(lexer.next()).toStrictEqual({type: 'StringLiteral', lexeme: 'nil: no such object\n'})
    expect(lexer.next().type).toBe('EOF')
  })

  it('returns StringLiteral token for string consisting of a single newline', () => {
    const message = "{\n}"
    const lexer = new Lexer(message)
    expect(lexer.next().type).toBe('StringLiteral')
    expect(lexer.next().type).toBe('EOF')
  })

  it('returns StringLiteral token for string including escape characters', () => {
    const message = `{ \[edit\]}`
    const lexer = new Lexer(message)
    expect(lexer.next()).toStrictEqual({type: 'StringLiteral', lexeme: ' [edit]'})
  })
})

describe('Lex color literals', () => {
  it('returns ColorLiteral token for "#aabbcc"', () => {
    const lexer = new Lexer('#aabbcc')
    expect(lexer.next()).toStrictEqual({type: 'ColorLiteral', lexeme: '#aabbcc'})
  })
})

describe('Lex identifiers', () => {
  it('returns Identifier token for "0x21ffd40"', () => {
    const lexer = new Lexer('0x21ffd40')
    expect(lexer.next()).toStrictEqual({type: 'Identifier', lexeme: '0x21ffd40'})
  })

  it('returns Identifier token for "0x21ffd40 "', () => {
    const lexer = new Lexer('0x21ffd40 ')
    expect(lexer.next()).toStrictEqual({type: 'Identifier', lexeme: '0x21ffd40'})
  })

  it('returns Identifier token for ".x2221af0.c"', () => {
    const lexer = new Lexer('.x2221af0.c')
    expect(lexer.next()).toStrictEqual({type: 'Identifier', lexeme: '.x2221af0.c'})
  })

  it('returns Identifier token for "pdwidget"', () => {
    const lexer = new Lexer('pdwidget')
    expect(lexer.next()).toStrictEqual({type: 'Identifier', lexeme: 'pdwidget'})
  })

  it('returns Identifier token for identifier with undescore', () => {
    const lexer = new Lexer('pdtk_watchdog')
    expect(lexer.next()).toStrictEqual({type: 'Identifier', lexeme: 'pdtk_watchdog'})
  })  
})

describe('Lex simple multiple tokens', () => {
  it('recognizes {}"', () => {
    const lexer = new Lexer('{}')
    expect(lexer.next()).toStrictEqual({type: 'BraceLeft'})
    expect(lexer.next()).toStrictEqual({type: 'BraceRight'})
  })
})

describe('Lex multiple tokens', () => {
  it('recognizes "pdtk_canvas_setparents .x2221af0 {} ;"', () => {
    const lexer = new Lexer('pdtk_canvas_setparents .x2221af0 {} ;')
    expect(lexer.next()).toStrictEqual({type: 'Identifier', lexeme: 'pdtk_canvas_setparents'})
    expect(lexer.next()).toStrictEqual({type: 'Identifier', lexeme: '.x2221af0'})
    expect(lexer.next()).toStrictEqual({type: 'BraceLeft'})
    expect(lexer.next()).toStrictEqual({type: 'BraceRight'})
    expect(lexer.next()).toStrictEqual({type: 'Semicolon'})
  })

  it('recognizes "{0.0 1.1 2.2 3.3}"', () => {
    const lexer = new Lexer('{0.0 1.1 2.2 3.3}')
    expect(lexer.next().type).toBe('BraceLeft')
    expect(lexer.next()).toStrictEqual({type: 'FPLiteral', lexeme: '0.0'})
    expect(lexer.next()).toStrictEqual({type: 'FPLiteral', lexeme: '1.1'})
    expect(lexer.next()).toStrictEqual({type: 'FPLiteral', lexeme: '2.2'})
    expect(lexer.next()).toStrictEqual({type: 'FPLiteral', lexeme: '3.3'})
    expect(lexer.next().type).toBe('BraceRight')
  })  
})
