import type { Token } from './tokens'
import type { Lexer } from './lexer'

export class TokenStream {
  tokens: Token[] = []
  peek_buffer: Token[] = []

  constructor(public lexer: Lexer) {}

  next() : Token {
    if (this.peek_buffer.length != 0) {
      this.tokens.push(this.peek_buffer[0])
      this.peek_buffer = this.peek_buffer.slice(1)
    } else {
      this.tokens.push(this.lexer.next())
    }
    return this.tokens[this.tokens.length - 1]
  }

  peek(count: number) : Token {
    while (this.peek_buffer.length < count) {
      const t = this.lexer.next()
      this.peek_buffer.push(t)
    }
    return this.peek_buffer[count - 1]
  }

  skip_until_newline() {
    this.lexer.skip_until_newline()
  }
}