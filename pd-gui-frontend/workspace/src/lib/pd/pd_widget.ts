export enum IOLetScope {
  Input, Output
}

export enum IOLetType {
  Message, Signal
}

export type IOLet = {
  index: number
  widget: PdWidget
  scope: IOLetScope
  type: IOLetType
}

export class PdWidget {
  inlets: IOLet[] = []
  outlets: IOLet[] = []

  constructor(public id:string, public klass: string, public x: number = 0, public y: number = 0) { }
}