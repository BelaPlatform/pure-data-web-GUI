import { writable } from "svelte/store"

export enum Theme {
  Vanilla,
  Max,
  Purr
}

export class App  {
  show_debug = writable<boolean>(false)
  theme = writable<Theme>(Theme.Vanilla)
}

// export const app = writable<App>(new App())
export const app = new App()
