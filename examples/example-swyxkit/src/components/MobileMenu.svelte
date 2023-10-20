<script>
	let isOpen = false;
	let isMenuRendered;
	$: {
		if (isOpen) {
			setTimeout(() => {
				isMenuRendered = true;
			}, 20);
		} else {
			setTimeout(() => {
				isMenuRendered = false;
			}, 300);
		}
	}
</script>

<div class="ml-[-0.60rem] md:hidden">
	<button
		class="burger visible"
		aria-label="Toggle menu"
		type="button"
		on:click={() => (isOpen = !isOpen)}
	>
		{#if !isOpen}
			<svg
				class="absolute h-5 w-5 text-gray-900 dark:text-gray-100"
				width="20"
				height="20"
				viewBox="0 0 20 20"
				fill="none"
				><path
					d="M2.5 7.5H17.5"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/><path
					d="M2.5 12.5H17.5"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/></svg
			>
		{:else}
			<svg
				class="absolute h-5 w-5 text-gray-900 dark:text-gray-100"
				viewBox="0 0 24 24"
				width="24"
				height="24"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				fill="none"
				shape-rendering="geometricPrecision"
				data-hide="true"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg
			>
		{/if}
	</button>
	{#if isOpen}
		<ul
			class="menu absolute flex flex-col bg-gray-50 text-2xl  uppercase dark:bg-gray-900"
			class:menuRendered={isMenuRendered}
		>
			<li
				class="border-b border-gray-300 font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100"
				style="transition-delay: 150ms;"
			>
				<a
					class="flex w-auto pb-4"
					on:click={() => setTimeout(() => (isOpen = false), 300)}
					href="/">Home</a
				>
			</li>
			<li
				class="border-b border-gray-300 font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100"
				style="transition-delay: 250ms;"
			>
				<a
					class="flex w-auto pb-4"
					on:click={() => setTimeout(() => (isOpen = false), 300)}
					href="/blog">Blog</a
				>
			</li>
			<li
				class="border-b border-gray-300 font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100"
				style="transition-delay: 350ms;"
			>
				<a
					class="flex w-auto pb-4"
					on:click={() => setTimeout(() => (isOpen = false), 300)}
					href="/about">About</a
				>
			</li>
			<li
				class="border-b border-gray-300 font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100"
				style="transition-delay: 400ms;"
			>
				<a
					class="flex w-auto pb-4"
					on:click={() => setTimeout(() => (isOpen = false), 300)}
					href="https://github.com/swyxio/swyxkit">GitHub</a
				>
			</li>
			<!-- <li
			class="border-b border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-semibold"
			style="transition-delay: 325ms;"
		>
			<a class="flex w-auto pb-4" on:click={() => setTimeout(() => isOpen = false, 200)} href="/tweets">Tweets</a>
		</li> -->
		</ul>
	{/if}
</div>

<style lang="postcss">
	.burger {
		transition: opacity 300ms ease;
		border: 0;
		background: transparent;
		width: 40px;
		height: 40px;
		position: relative;
	}

	.burger svg {
		transform: translate(-50%, -50%) scale(1);
		top: 50%;
		left: 50%;
		opacity: 1;
		transition: opacity 300ms ease, transform 300ms ease;
	}

	.menu {
		padding: 0 28px 0 4px;
		margin: 0;
		padding-top: 24px;
		width: 100%;
		height: 100vh;
		z-index: 1000;
		opacity: 0;
		left: 0;
		transition: opacity 300ms ease, transform 300ms ease;
	}

	.menu li {
		transform: translateX(-16px);
		opacity: 0;
		transition: opacity 300ms ease, transform 300ms ease, width 300ms ease, border-color 300ms ease;
		width: 0px;
		white-space: nowrap;
	}

	.menuRendered {
		opacity: 1;
	}

	.menuRendered li {
		@apply w-full border-gray-200 dark:border-gray-600;
		transform: translateX(0);
		opacity: 1;
	}

	.menu > * + * {
		margin-top: 24px;
	}

	@keyframes grow {
		0% {
			height: 0px;
		}
		100% {
			height: 24px;
		}
	}
</style>
