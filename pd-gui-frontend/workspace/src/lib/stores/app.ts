import { writable } from "svelte/store"

import { App } from '../shell/app'

export const app = writable<App>(new App())