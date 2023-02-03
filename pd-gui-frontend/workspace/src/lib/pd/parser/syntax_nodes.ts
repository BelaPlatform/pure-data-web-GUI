import type { TokenType } from "./tokens"

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
  elements: SyntaxNode[] = []

  constructor() { 
    super() 
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