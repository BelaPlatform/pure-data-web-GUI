import type { Token, TokenType } from "./tokens"

export class SyntaxNode {}

export class ValueNode extends SyntaxNode {}

export class EmptyValueNode extends SyntaxNode {}

export class NumberNode extends ValueNode {
  constructor(public value: string, public type_annotation: TokenType) { super() }
}

export class StringNode extends ValueNode {
  constructor(public value: string, public type_annotation: TokenType = 'StringLiteral') { super() }
}

export class VectorNode extends ValueNode {

  raw_text: string = ''

  constructor(public start: Token, public end: Token, public elements: SyntaxNode[], src: string) { 
    super()
    this.raw_text = src.substring(start.start_idx!, end.start_idx! - 1)
  }

  as_text() : string {
    return this.raw_text
  }
}

export class PropertyNode extends SyntaxNode {
  constructor(public key: Identifier, public value: ValueNode) { 
    super()
  }
}

export class Identifier extends SyntaxNode {
  constructor(public name: string, public namespace: Identifier|null = null) { 
    super()
  }
}

export class Procedure extends SyntaxNode {
  arguments: SyntaxNode[] = []

  constructor(public id: Identifier) {
    super()
  }
}

export class RootNode {
  procs: Procedure[] = []
}