import { PdMessages } from '../pd_messages'

export function parse_window_message(message:string) {
  if (message.startsWith("::pdwindow::logpost")) {
    // find first '{'
    const left_brace = message.indexOf('{')
    // console.log(left_brace)
    const right_brace = message.indexOf('}')
    // console.log(right_brace)
    const message_payload = message.substring(left_brace + 1, right_brace)
    PdMessages.push(message_payload)
    // console.log(post)
  }

  if (message.startsWith("::pdwindow::post")) {
    // find first '{'
    const left_brace = message.indexOf('{')
    // console.log(left_brace)
    const right_brace = message.indexOf('}')
    // console.log(right_brace)
    const message_payload = message.substring(left_brace + 1, right_brace)
    PdMessages.push(message_payload)
    // console.log(post)
  }  
}