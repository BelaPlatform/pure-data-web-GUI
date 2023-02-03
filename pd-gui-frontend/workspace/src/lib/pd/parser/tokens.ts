export type TokenType =
  'BraceLeft' | 'BraceRight' | 'ParenLeft' | 'ParenRight' | 'BracketLeft' | 'BracketRight' | 'Semicolon' | 'Newline' |
  'ColonColon' | 'Minus' | 'Plus' |
  'Identifier' |
  'StringLiteral' | 'ColorLiteral' | 'IntegerLiteral' | 'FPLiteral' |
  'Unknown' | 
  'EOF'

export type Token = {
  type: TokenType
  lexeme?: string
}