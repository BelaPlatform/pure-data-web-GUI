import * as G from './geometry'

export class PdConnection {
  constructor(public id:string,  public from:G.Point = G.NullPoint(), public to:G.Point = G.NullPoint()) { }
}