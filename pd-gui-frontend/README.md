To simply run the app:

```
./run.sh
```

Development workflow:

```
./run-dev.sh
```
gives you an interactive shell into the container, with the `workspace` folder mounted in `/workspace`. There you'll need to run:

```
pnpm install
pnpm run build
pnpm start:watch
```

wait a few seconds after you see
```
package  	files	  time	   avg
workspace	    1	66.4ms	66.4ms
```
and you'll be able to open a browser tab on port 8080. Any changes in `workspace/` will be automatically rebuilt and the page refreshed.
