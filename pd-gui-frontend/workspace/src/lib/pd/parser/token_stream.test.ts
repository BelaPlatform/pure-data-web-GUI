import { describe, it, expect } from 'vitest'

import { MockLexer } from './mock_lexer'
import type { TokenType, Token } from './tokens'
import { TokenStream } from './token_stream'

describe('TokenStream', () => {
  it('Next returns next token', () => {
    const expected = {type: 'ColonColon'} as Token
    const lexer = new MockLexer([expected])
    const ts = new TokenStream(lexer)
    expect(ts.next()).toStrictEqual(expected)
  })

  it('Peek one returns next unconsumed token, next returns and consumes the same token', () => {
    const expected = {type: 'ColonColon'} as Token
    const lexer = new MockLexer([expected])
    const ts = new TokenStream(lexer)
    expect(ts.peek(1)).toStrictEqual(expected)
    expect(ts.next()).toStrictEqual(expected)
  })

  it('Peek two returns next-next unconsumed token, next returns and consumes the first token, then the second', () => {
    const first = {type: 'IntegerLiteral', lexeme: '1'} as Token
    const second = {type: 'IntegerLiteral', lexeme: '2'} as Token
    const lexer = new MockLexer([first, second])
    const ts = new TokenStream(lexer)
    expect(ts.peek(2)).toStrictEqual(second)
    expect(ts.next()).toStrictEqual(first)
    expect(ts.next()).toStrictEqual(second)
  })
})
