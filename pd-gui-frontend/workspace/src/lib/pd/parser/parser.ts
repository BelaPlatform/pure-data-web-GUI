import { Identifier, NumberNode, Procedure, RootNode, VectorNode, PropertyNode, ValueNode, EmptyValueNode, StringNode } from './syntax_nodes'
import type { TokenType } from './tokens'
import type { TokenStream } from './token_stream'

export interface Ok {
  kind: 'ok'
  root: RootNode
}

export interface Err {
  kind: 'err'
  error: string
}

export type Result = Ok | Err

export class Parser {
  root = new RootNode()

  constructor(public ts: TokenStream) {}

  parse() : Result {
    do {
      while(this.ts.peek(1).type == 'Newline') {
        this.ts.next()
      }
      const proc = this.parse_procedure()
      if (proc) {
        this.root.procs.push(proc)
      } else {
        return {error: "huh?!?!", kind:'err'}
      }
    } while(this.ts.peek(1).type != 'EOF');
    return {root: this.root, kind:'ok'}
  }

  parse_identifier(parent: Identifier = new Identifier('', null)) : Identifier {
    // console.log('parse_identifier')
    let token = this.ts.peek(1)
    if (token.type == 'ColonColon') {
      // console.log('eat ColonColon')
      this.ts.next()
      token = this.ts.next()
      const id = new Identifier(token.lexeme!, parent)
      // console.log(`id ${token.lexeme!}`)
      if (this.ts.peek(1).type == 'ColonColon') {
        return this.parse_identifier(id)
      } else {
        return id
      }
    } else if (token.type == 'Identifier') { 
      this.ts.next()
      // console.log(`Identifier ${token.lexeme!}`)
      return new Identifier(token.lexeme!, parent)
    } else {
      // console.log('huuuh?')
      // console.log(token)
      throw new Error(`unknown thing: ${token.type}`)
    }
    return parent
  }

  parse_procedure() : Procedure | null {
    // console.log('parse_procedure')
    const identifier = this.parse_identifier()
    if (identifier.name.length == 0) {
      // console.log('identifier.name.length == 0')
      return null
    }
    // console.log(`parse_procedure got identifier ${identifier.name}`)
    // console.log(t)
    const proc = new Procedure(identifier)
    while (true) {
      let peeked = this.ts.peek(1)

      if (peeked.type == 'Identifier'
        || peeked.type == 'ColonColon') {
        proc.arguments.push(this.parse_identifier())
        continue
      }

      if (peeked.type == 'IntegerLiteral' || peeked.type == 'FPLiteral') {
        proc.arguments.push(new NumberNode(peeked.lexeme!, peeked.type))
        this.ts.next()
        continue
      }

      if (peeked.type == 'StringLiteral' || peeked.type == 'ColorLiteral') {
        proc.arguments.push(new StringNode(peeked.lexeme!, peeked.type))
        this.ts.next()
        continue
      }

      if (peeked.type == 'BraceLeft') {
        proc.arguments.push(this.parse_vector())
        continue
      }

      if (peeked.type == 'Minus') {
        proc.arguments.push(this.parse_property())
        continue
      }

      // ignore (nil)
      if (peeked.type == 'ParenLeft') {
        while(peeked.type != 'ParenRight') {
          peeked = this.ts.next()
        }
        continue
      }

      // some commands end with ";\n"
      // some commands end with ";"
      // some commands end with "\n"
      // and some commands have no terminator at all...
      if (peeked.type == 'Semicolon') {
        this.ts.next()
        // console.log('eating Semicolon')
        peeked = this.ts.peek(1)
      }

      if (peeked.type == 'Newline') {
        this.ts.next()
        // console.log('eating Newline')
      }

      break
    }
    return proc
  }

  parse_vector() : VectorNode {
    let token = this.ts.next()
    const vec = new VectorNode()
    while (true) {
      token = this.ts.next()
      if (token.type == 'BraceRight') {
        break
      }

      if (token.type == 'IntegerLiteral'
        ||token.type == 'FPLiteral') {
          vec.elements.push(new NumberNode(token.lexeme!, token.type))  
      }

      if (token.type == 'Identifier') {
        vec.elements.push(new StringNode(token.lexeme!))
      }
    }

    return vec
  }

  parse_property() : PropertyNode {
    // eat the '-'
    this.ts.next()
    const key = this.parse_identifier()
    const peeked = this.ts.peek(1)
    if (peeked.type == 'BraceLeft') {
      return new PropertyNode(key, this.parse_vector())
    }

    if (peeked.type == 'StringLiteral') {
      this.ts.next()
      return new PropertyNode(key, new StringNode(peeked.lexeme!))
    }

    if (peeked.type == 'ColorLiteral') {
      this.ts.next()
      return new PropertyNode(key, new StringNode(peeked.lexeme!, 'ColorLiteral'))
    }

    if (peeked.type == 'IntegerLiteral'
      || peeked.type == 'FPLiteral') {
        this.ts.next()
      return new PropertyNode(key, new NumberNode(peeked.lexeme!, peeked.type))
    }
    return new PropertyNode(key, new EmptyValueNode())
  }
}
