<script>
	// https://rodneylab.com/using-local-storage-sveltekit/
	import { browser } from '$app/environment';
	import { writable } from 'svelte/store';

	const defaultValue = true;
	const initialValue = browser
		? window.localStorage.getItem('isNewsletterOpen') ?? defaultValue
		: defaultValue;

	const isNewsletterOpen = writable(!!initialValue);

	isNewsletterOpen.subscribe((value) => {
		if (browser) {
			window.localStorage.setItem('isNewsletterOpen', value ? 'true' : 'false');
		}
	});

	function toggleNewsletter() {
		$isNewsletterOpen = !$isNewsletterOpen;
	}
</script>

<section class="mb-16 w-full" id="newsletter">
	<div
		class="my-4 w-full border-y border-blue-200 bg-blue-50 p-6 dark:border-gray-600 dark:bg-gray-800 sm:rounded sm:border-x"
	>
		<div class="flex items-center justify-between space-x-4 text-gray-900 dark:text-gray-100">
			<p class="text-lg font-bold md:text-xl">Subscribe to the newsletter</p>

			<button
				aria-label="Toggle Newsletter CTA"
				class="flex h-9 w-9  items-center justify-center rounded-lg ring-gray-300 transition-all hover:ring-2"
				on:click={toggleNewsletter}
			>
				{#if isNewsletterOpen}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
							clip-rule="evenodd"
						/>
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M15.707 4.293a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 011.414-1.414L10 8.586l4.293-4.293a1 1 0 011.414 0zm0 6a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 111.414-1.414L10 14.586l4.293-4.293a1 1 0 011.414 0z"
							clip-rule="evenodd"
						/>
					</svg>
				{/if}
			</button>
		</div>
		{#if isNewsletterOpen}
			<p class="my-1 text-gray-800 dark:text-gray-200">
				Get emails from me about <span class="font-bold"
					>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Libero, ducimus.</span
				>.
			</p>

			<form
				class="relative my-4"
				action="https://buttondown.email/api/emails/embed-subscribe/swyx"
				method="post"
				target="popupwindow"
				on:submit={() => toggleNewsletter() && window.open('https://buttondown.email/swyx', 'popupwindow')}
			>
				<input
					type="email"
					id="bd-email"
					name="email"
					aria-label="Email for newsletter"
					placeholder="tim@apple.com"
					autocomplete="email"
					required={true}
					class="mt-1 block w-full rounded-md border-gray-300 bg-white px-4 py-2 pr-32 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
				/><button
					class="absolute right-1 top-1 flex h-8 w-28 items-center justify-center rounded bg-gray-100 px-4 pt-1 font-medium text-gray-900 dark:bg-gray-700 dark:text-gray-100"
					type="submit">Subscribe</button
				>
			</form>
			<p class="text-sm text-gray-800 dark:text-gray-200">
				5,432 subscribers including my Mom – <a href="/#newsletter">123 issues</a>
			</p>
		{/if}
	</div>
</section>
