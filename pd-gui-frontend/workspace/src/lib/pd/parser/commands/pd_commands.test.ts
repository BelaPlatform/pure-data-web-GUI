import { describe, it, expect } from 'vitest'
import { Pd } from '../../pd'

import * as Commands from './pd_commands'

class PdSpy extends Pd {
  did_send_ping = false

  override send_ping() {
    this.did_send_ping = true
  }
}

describe('Ping', () => {
  const command = new Commands.Ping()
  const pd = new PdSpy()
  it('sends a ping', () => {
    command.eval(pd)
    expect(pd.did_send_ping).toBe(true)
  })
})
