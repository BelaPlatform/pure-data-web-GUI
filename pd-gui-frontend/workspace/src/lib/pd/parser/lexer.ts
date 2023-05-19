import type { Token } from './tokens'

export type StringView = {
  ref: string
  start: number
  end: number
}


function is_digit(char: string) {
  return /\d/.test(char)
}

function is_alpha(char: string) {
  return /^[a-zA-Z]+$/.test(char)
}

function is_hex(char: string) {
  return /^[a-fA-F0-9]+$/.test(char)
}

function is_alnum(char: string) {
  return is_digit(char) || is_alpha(char)
}

export class Lexer {
  rest: StringView

  constructor(public message: string) {
    this.rest = {ref: message, start: 0, end: message.length != 0 ? message.length : 0}
  }

  next() : Token {
    // eat whitespace
    while (this.peek_char(0) == ' ') {
      this.advance(1)
    }

    let char = this.peek_char(0)

    if (this.eof()) {
      return {type: 'EOF'}
    }
    
    if (char == ';') {
      this.advance(1)
      return {type: 'Semicolon'}
    }

    if (char == ',') {
      this.advance(1)
      return {type: 'Comma'}
    }

    if (char == '\n') {
      this.advance(1)
      return {type: 'Newline'}
    }

    if (char == '+') {
      this.advance(1)
      return {type: 'Plus', lexeme: '+'}
    }

    if (char == '$') {
      this.advance(1)
      return {type: 'Dollar', lexeme: '$'}
    }

    if (char == '-') {
      if (is_digit(this.peek_char(1))) {
        // this is a negative number, handle this later
      }
      else {
        this.advance(1)
        return {type: 'Minus'}
      }
    }

    if (char == '{') {
      let token = this.try_string()
      if (!token) {
        this.advance(1)
        token = {type: 'BraceLeft', start_idx: this.rest.start}
      }
      return token
    }

    if (char == '}') {
      this.advance(1)
      return {type: 'BraceRight', start_idx: this.rest.start}
    }

    if (char == '(') {
      this.advance(1)
      return {type: 'ParenLeft'}
    }

    if (char == ')') {
      this.advance(1)
      return {type: 'ParenRight'}
    }

    if (char == '[') {
      this.advance(1)
      return {type: 'BracketLeft'}
    }

    if (char == ']') {
      this.advance(1)
      return {type: 'BracketRight'}
    }

    // ColonColon is a namespace separator
    if (char == ':') {
      const peek1_char = this.peek_char(1)
      if (peek1_char == ':') {
        this.advance(2)
        return {type: 'ColonColon'}
      }
      return {type: 'Unknown', lexeme: this.rest.ref}
    }

    // color literal, e.g. #fcfcfc
    // used with properties: "-bcolor #fcfcfc -fcolor #000000 -lcolor #000000"
    if (char == '#') {
      let token = this.try_color_literal()
      if (!token) {
        this.advance(1)
        token = {type: 'StringLiteral', lexeme: '#'}
      }
      return token
    }

    // identifiers
    // unquoted strings like "connection" or "runmode_nothing"
    // or canvas ids like ".x16fe310.c"
    // or object ids like "0x1719850"
    if (is_alpha(char)
      || (char == '0' && this.peek_char(1) == 'x')
      || (char == '.' && this.peek_char(1) == 'x')) {
      let peek_count = 1
      while (true) {
        const char = this.peek_char(peek_count++)
        if (is_alnum(char) || char == '.' || char == '_' || char == '/') {
          continue
        }
        break
      }

      return {type: 'Identifier', lexeme: this.advance(peek_count-1)}
    }


    // numbers
    if (is_digit(char) || char == '-') {
      let peek_count = 1
      let is_floating_point = false
      let done = false
      while (!done) {
        const char = this.peek_char(peek_count++)
        if (is_digit(char)) {
          continue
        }
        if (char == '.') {
          is_floating_point = true
          continue
        }
        done = true
      }

      return {type: is_floating_point ? 'FPLiteral' : 'IntegerLiteral', lexeme: this.advance(peek_count - 1)}
    }

    return {type: 'Unknown', lexeme: this.rest.ref}
  }

  skip_until_newline() {
    let skip_count = 0
    while (this.peek_char(0) != '\n') {
      this.advance(1)
      skip_count += 1
    }
  }

  private eof() : boolean {
    return this.rest.start == this.rest.end
  }

  // look ahead without consuming characters
  private peek_char(count: number) {
    // console.log(`peek_char ${count}`)
    // console.log(this.rest.ref)
    if (this.rest.start + count >= this.rest.end) {
      return ''
    }
    const char = this.rest.ref[this.rest.start + count]
    // console.log(char)
    return char
  }

  // consume characters
  private advance(count: number) : string {
    const eaten = this.rest.ref.substring(this.rest.start, this.rest.start + count)
    // console.log(`advance ${count} ${eaten}`)
    this.rest.start += count
    return eaten
  }

  private try_color_literal() : Token|null {
    let peek_count = 1
    while(peek_count < 7) {
      const char = this.peek_char(peek_count)
      if (is_hex(char)) {
        peek_count++
        continue
      }
      break
    }
    if (peek_count == 7) {
      return {type: 'ColorLiteral', lexeme: this.advance(peek_count)}
    } else {
      return null
    }
  }

  private try_string() : Token|null {
    let peek_count = 1
    let char = this.peek_char(peek_count)

    // not a string but a vector with a number
    if (is_digit(char)) {
      return null
    }

    // a nested vector
    if (char == '{') {
      return null
    }

    // an empty vector
    if (char == '}') {
      return null
    }

    // a negative number?
    if (char == '-') {
      if (is_digit(this.peek_char(2))) {
        return null
      }
    }

    if (char == '') {
      return null
    }

    // eat opening '{'
    const advanced = this.advance(1)
    // console.log(`advanced ${advanced}`)

    char = this.peek_char(0)
    // console.log(`new peeked ${char}`)
    // while(is_alpha(char) || char == '/' || char == ':' || char == '\n') {
    while(char != '}') {
      char = this.peek_char(peek_count++)
      // console.log(char)
      // console.log(char.charCodeAt(0))
    }
    let lexeme = this.advance(peek_count-1)
    // lexeme = lexeme.trim()
    const literal = {type: 'StringLiteral', lexeme } as Token
    // eat the closing '}'
    this.advance(1)
    return literal
  }
}