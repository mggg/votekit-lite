import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { spawn } from 'child_process';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		{
			name: 'votekit-schema-watcher',
			handleHotUpdate({ file }) {
				if (file.endsWith('src/lib/types/votekitConfig.ts')) {
					console.log('⚡ votekitConfig changed → regenerating schema...');
					const proc = spawn('pnpm', ['run', 'export-common-types'], {
						stdio: 'inherit',
						shell: true
					});
					proc.on('close', (code) => {
						if (code !== 0) {
							console.error('Schema generation failed.');
						}
					});
				}
			}
		}
	]
});
