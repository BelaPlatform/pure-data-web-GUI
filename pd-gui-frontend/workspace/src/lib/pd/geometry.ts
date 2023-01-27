export class Point {
  constructor(public x:number, public y:number) {}
}

export function NullPoint() {
  return new Point(0, 0)
}

export class Size {
  constructor(public width:number, public height:number) {}
}

export function NullSize() {
  return new Size(0, 0)
}

export class Rect {
  constructor(public origin:Point, public size:Size) {}

  contains_point(p:Point) {
    const tl = this.top_left()
    const br = this.bottom_right()
    return tl.x <= p.x
      && tl.y <= p.y
      && br.x >= p.x
      && br.y >= p.y
  }

  contains_rect(rhs:Rect) {
    const tl = this.top_left()
    const br = this.bottom_right()
    const tl_rhs = rhs.top_left()
    const br_rhs = rhs.bottom_right()
    return tl.x <= tl_rhs.x
      && tl.y <= tl_rhs.y
      && br.x >= br_rhs.x
      && br.y >= br_rhs.y
  }

  top_left() {
    return this.origin
  }

  bottom_right() {
    return new Point(this.origin.x + this.size.width, this.origin.y + this.size.height)
  }

  get center() {
    return new Point(this.origin.x + this.size.width / 2, this.origin.y + this.size.height / 2)
  }
}

export function NullRect() {
  return new Rect(NullPoint(), NullSize())
}
