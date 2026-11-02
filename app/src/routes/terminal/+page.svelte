<script lang="ts">
	import { onMount, tick } from 'svelte';
	import bootstrap from './bootstrap.py?raw';

	// Pyodide 0.29 = Python 3.13. Pyodide 314 (Python 3.14) breaks `import votekit` 3.4.0:
	// its __init__ loops set __module__ on typing.Union aliases, which 3.14 made immutable.
	const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.29.5/full/';

	let lines = $state<{ text: string; err?: boolean }[]>([
		{ text: 'Loading Pyodide and votekit (tens of MB on first visit, cached after)…' }
	]);
	let prompt = $state('>>> ');
	let input = $state('');
	let ready = $state(false);
	let out = $state<HTMLPreElement>();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let repl: any;

	async function print(text: string, err = false) {
		lines.push({ text, err });
		await tick();
		out?.scrollTo(0, out.scrollHeight);
	}

	onMount(async () => {
		try {
			const { loadPyodide } = await import(/* @vite-ignore */ `${PYODIDE_URL}pyodide.mjs`);
			const py = await loadPyodide({ indexURL: PYODIDE_URL });
			py.setStdout({ batched: (s: string) => print(s) });
			py.setStderr({ batched: (s: string) => print(s, true) });
			await py.loadPackage('micropip');
			await py.runPythonAsync(bootstrap);
			repl = py.globals.get('repl');
			await py.runPythonAsync(
				'from importlib.metadata import version\nprint(f"votekit {version(\'votekit\')} on Python {sys.version.split()[0]}")'
			);
			ready = true;
		} catch (e) {
			print(String(e), true);
		}
	});

	// ponytail: Pyodide runs on the main thread, so long simulations freeze the page and Ctrl-C
	// can't interrupt. Move it into a Web Worker (with an interrupt buffer) when that bites.
	async function run(e: SubmitEvent) {
		e.preventDefault();
		const line = input;
		input = '';
		await print(prompt + line);
		ready = false;
		prompt = await repl(line);
		ready = true;
	}
</script>

<div class="card bg-base-100 p-4 shadow-sm">
	<pre
		bind:this={out}
		class="h-[60vh] overflow-y-auto font-mono text-sm whitespace-pre-wrap">{#each lines as l}<span
				class={l.err ? 'text-error' : ''}>{l.text}{'\n'}</span
			>{/each}</pre>
	<form onsubmit={run} class="flex items-center gap-2 font-mono text-sm">
		<label for="py-input">{prompt}</label>
		<!-- svelte-ignore a11y_autofocus -->
		<input
			id="py-input"
			bind:value={input}
			disabled={!ready}
			autofocus
			autocomplete="off"
			spellcheck="false"
			class="input input-sm flex-1 font-mono"
		/>
	</form>
</div>
