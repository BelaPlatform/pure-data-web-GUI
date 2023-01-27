import * as G from './geometry'

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
  text: string = ''
  box: G.Rect

  constructor(public id:string, public klass: string, x: number = 0, y: number = 0) { 
    this.box = new G.Rect(new G.Point(x, y), new G.Size(0, 0))
  }
}