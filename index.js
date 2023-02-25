let cp = require("child_process");
let fs = require("fs");
let config = {GUI_PORT: 0xdada}

let commandsProd = [
	{
		name: 'shim',
		run: 'pnpm',
		args: ["start:watch"],
		cwd: 'pd-gui-shim/workspace',
		ready: {out: 'server bound on'},
	},
	{
		name: 'pd',
		run: './pd',
		args: ["-guiport", `${config.GUI_PORT}`],
		cwd: 'pd/pure-data/src',
		ready: {err: 'priority 94 scheduling failed'},
		onchange: {
			run: 'echo', args: ['TODO: rebuild'],
		}
	},
	{
		name: 'frontend',
		run: 'node',
		args: ['pd-gui-frontend/workspace/dist'],
		cwd: '',
		ready: {},
	},
];
let commandsDev = [
	{
		name: 'shim',
		run: 'pnpm',
		args: ["start:watch"],
		cwd: 'pd-gui-shim/workspace',
		ready: {out: 'server bound on'},
	},
	{
		name: 'pd',
		run: './pd',
		args: ["-guiport", `${config.GUI_PORT}`],
		cwd: 'pd/pure-data/src',
		ready: {err: 'priority 94 scheduling failed'},
		onchange: {
			run: 'echo', args: ['TODO: rebuild'],
		}
	},
	{
		name: 'frontend',
		run: 'pnpm',
		args: ["start:watch"],
		cwd: 'pd-gui-frontend/workspace',
		ready: {},
	},
];
let commands = process.argv[2] == 'dev' ? commandsDev : commandsProd;
console.log(process.argv[2] == 'dev' ? "DEV" : "PROD");
	
async function run(cmd) {
	let pr = cp.spawn(cmd.run, cmd.args, {
		cwd: cmd.cwd,
	})
	children.push(pr);
	let promise = new Promise((resolve, reject) => {
		pr.stdout.on('data', (data) => {
			process.stdout.write(`${cmd.name}: ${data}`);
			if(cmd.ready.out && data.includes(cmd.ready.out))
			{
				console.log("RESOLVING", cmd.name)
				resolve(pr);
			}
		})
		pr.stderr.on('data', (data) => {
			process.stderr.write(`${cmd.name}: ${data}`);
			if(cmd.ready.err && data.includes(cmd.ready.err))
			{
				console.log("RESOLVING ERR", cmd.name)
				resolve(pr);
			}
		})
	})
	return promise;
}
let children = []
let cleanup = () => {
	console.log("cleanup")
	for(let child of children)
		child.kill(2)
};
process.on("exit", cleanup)
process.on("SIGINT", cleanup)
process.on("SIGTERM", cleanup)
async function runCommands()
{
	for(let n in commands)
	{
		let cmd = commands[n];
		await run(cmd);
		/*
		if(cmd.onchange)
		{
			// run immediately, to rebuild before we start
			cp.spawn(cmd.onchange.run, cmd.onchange.args, { cwd: cmd.cwd })
			let watcher = (n) => {
				console.log("CMD ", n, "WATCHED")
			}
			fs.watch(cmd.cwd, {
				recursive: true,
			}, watcher.bind(null, n));
		}
		*/
	}
}
runCommands();
