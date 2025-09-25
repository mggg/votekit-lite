<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	// tell TypeScript "this will exist at runtime"

	export let siteKey: string; // pass your reCAPTCHA site key
	export let onVerify: (token: string) => void; // callback when verified
	export let onExpired: () => void = () => {}; // optional callback

	let widgetId: number | null = null;
	if (browser) {
		// reCAPTCHA callback (must be on window for Google's script)
		(window as any).onRecaptchaVerify = (token: string) => {
			onVerify(token);
		};

		(window as any).onRecaptchaExpired = () => {
			onExpired();
		};

		onMount(() => {
			// load the reCAPTCHA script if not already loaded
			if (!document.querySelector('#recaptcha-script')) {
				const script = document.createElement('script');
				script.id = 'recaptcha-script';
				script.src =
					'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
				script.async = true;
				script.defer = true;
				document.head.appendChild(script);
			} else {
				renderRecaptcha();
			}

			(window as any).onRecaptchaLoad = () => {
				renderRecaptcha();
			};
		});
	}

	function renderRecaptcha() {
		// @ts-ignore
		if (typeof grecaptcha !== 'undefined' && widgetId === null) {
			// @ts-ignore
			widgetId = grecaptcha.render('recaptcha-container', {
				sitekey: siteKey,
				callback: 'onRecaptchaVerify',
				'expired-callback': 'onRecaptchaExpired'
			});
		}
	}
</script>

<div id="recaptcha-container"></div>
