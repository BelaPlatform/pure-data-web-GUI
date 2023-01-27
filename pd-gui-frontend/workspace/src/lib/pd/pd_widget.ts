export class PdWidget {
  inlets: number = 0
  outlets: number = 0
  
  constructor(public id:string, public klass: string, public x: number = 0, public y: number = 0) {
    // console.log(id)
    // console.log(klass)
    // console.log(x)
    // console.log(y)
  }
}