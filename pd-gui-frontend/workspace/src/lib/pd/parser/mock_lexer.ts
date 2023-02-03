import { Lexer } from './lexer'
import type { TokenType, Token } from './tokens'

export class MockLexer extends Lexer {
  idx: number = 0

  constructor(public tokens: Token[]) {
    super('')
  }

  override next() : Token {
    if (this.idx >= this.tokens.length) {
      return {type: 'EOF'}
    }
    return this.tokens[this.idx++]
  }
}