export type TokenType =
  'BraceLeft' | 'BraceRight' | 'ParenLeft' | 'ParenRight' | 'BracketLeft' | 'BracketRight' | 'Semicolon' | 'Newline' |
  'ColonColon' | 'Minus' | 'Plus' | 'Dollar' | 'Comma' |
  'Identifier' |
  'StringLiteral' | 'ColorLiteral' | 'IntegerLiteral' | 'FPLiteral' |
  'Unknown' | 
  'EOF'

export type Token = {
  type: TokenType
  start_idx?: number
  lexeme?: string
}