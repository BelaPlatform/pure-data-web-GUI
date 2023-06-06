import { Lexer } from './lexer'
import type { Command } from './commands/command'
import { TokenStream } from './token_stream'
import { Parser } from './parser'
import type { Pd } from '../pd'
import { transform } from './transformer'
import { PdMessages } from '../pd_messages'

export class Interpreter {
  constructor(public context:Pd) {}

  interpret(message: string) {
    // console.log("interpret")
    // console.log(message)
    if (message == '') {
      return
    }
    const commands = this.build_command_vec(message)
    this.eval(commands)
  }

  build_command_vec(message: string) : Command[] {
    const lexer = new Lexer(message)
    const ts = new TokenStream(lexer)
    const parser = new Parser(ts)
    const parse_result = parser.parse()
    if(parse_result.kind == 'ok') {
      return transform(parse_result.root)
    } else {
      return []
    }
  }

  eval(commands: Command[]) {
    commands.forEach(c => {
      c.eval(this.context)
    })
  }
}
/* if(typeof io !== "undefined")
{
  let belaIdeSocket = io(location.protocol + '//' + location.hostname + '/IDE');
  belaIdeSocket.on('status', function (data) {
    if(data && data.belaLog)
      PdMessages.push(data.belaLog + '\n')
    if(data && data.belaLogErr)
      PdMessages.push(data.belaLogErr + '\n')
  });
}
 */