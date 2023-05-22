export type RpcMessage = {
  rpcid: number
}

export enum PushTxRpcId {
  Close,          // there's already a frontend connected
  Continue,       // you are the only frontend, continue and connect to the Pd message stream
  PdUnavailable,  // Pd did disconnect
  PdAvailable     // Pd did connect
}

export enum PushRxRpcId {
  PdAvailable // is Pd running?
}
