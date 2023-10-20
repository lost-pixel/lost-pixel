<script>
	// import Nav from '../components/Nav.svelte';
	import { dev } from '$app/environment';
	import { page } from '$app/stores';

	const offline = typeof navigator !== 'undefined' && navigator.onLine === false;

	let message = offline ? 'Find the internet and try again' : $page.error?.message;

	let title = offline ? 'Offline' : $page.status;
	if ($page.status === 404) {
		title = 'Page not found :(';
		message = 'Sorry! If you think this URL is broken, please let me know!';
	}

	function displayPathname(str) {
		return decodeURIComponent(str).replaceAll('-', ' ');
	}
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<section class="container prose mx-auto py-12 dark:prose-invert">
	<h1>{$page.status}: {title}</h1>

	{#if $page.status === 404}
		<p class="">There is no post at the slug <code>{$page.url.pathname}</code>.</p>
		<p>
			<a href={'/blog?filter=' + $page.url.pathname.slice(1)}
				>Try searching for "{displayPathname($page.url.pathname.slice(1))}" here!</a
			>
		</p>
		<p class="">If you believe this was a bug, please let me know!</p>
	{:else}
		<p class="font-mono">{message}</p>
	{/if}
	{#if dev && $page.error.stack}
		<pre class="mono overflow-scroll bg-gray-800 p-8">{$page.error.stack}</pre>
	{/if}
</section>

<style>
	h1,
	p {
		margin: 0 auto;
	}

	h1 {
		font-size: 2.8em;
		font-weight: 700;
		margin: 0 0 0.5em 0;
	}

	p {
		margin: 1em auto;
	}

	@media (min-width: 480px) {
		h1 {
			font-size: 4em;
		}
	}
</style>
