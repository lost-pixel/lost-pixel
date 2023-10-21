<script>
	import { onMount } from "svelte";


	export let tocStore;
	let isOpen = false;
	onMount(() => {
		// set isOpen if window width is mobile checking the media query
		if (window.matchMedia("(min-width: 640px)").matches) {
			isOpen = true;
		}
	})

</script>

<!-- Table of contents thing -->
{#if Object.values($tocStore.items).length && Object.values($tocStore.items).length > 1}
	<section
		class="fixed right-4 bottom-1 max-w-[12em] rounded-xl bg-white/25 hover:bg-white/30 p-2 backdrop-blur"
	>
		{#if !isOpen}
			<button class="flex justify-center items-center z-50" on:click={() => (isOpen = !isOpen)}>
				<h2 class="text-orange-700 dark:text-orange-400">Table of <br /> Contents</h2>
			</button>
		{/if}
		{#if isOpen}
			<ul class="space-y-2 max-h-80 overflow-auto">
				<h2 class="text-orange-700 dark:text-orange-400">
					Table of Contents
					<button class="hover:text-white" on:click={() => (isOpen = !isOpen)}> [X] </button>
				</h2>
				{#each Object.values($tocStore.items) as { id, text }}
					<a
						class="ml-2 block bg-opacity-25 text-sm"
						class:!text-red-300={$tocStore.activeItem?.id === id}
						class:underline={$tocStore.activeItem?.id === id}
						href="#{id}"
					>
						<li>{text}</li>
					</a>
				{/each}
			</ul>
		{/if}
	</section>
{/if}
