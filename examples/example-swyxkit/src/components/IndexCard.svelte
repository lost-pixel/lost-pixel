<script>
	// href={item.slug} title={item.data.title} date={item.data.date}
	export let href = '#';
	/** @type {import('$lib/types').ContentItem} */
	export let item = undefined;
	/** @type {import('$lib/types').GHMetadata} */
	export let ghMetadata = null;
	export let title = 'Untitled post';
	/** @type {string} */
	export let stringData = 'no date';
</script>

<a
	class="w-full text-gray-900 hover:text-yellow-600 dark:text-gray-100 dark:hover:text-yellow-100 hover:no-underline"
	{href}
	><div class="w-full">
		<div class="flex flex-col justify-between md:flex-row">
			<h4 class="flex-auto w-full mb-2 text-lg font-bold md:text-xl">
				{title}
			</h4>
		</div>
		<p class="text-gray-600 mb-2 break-all sm:break-words dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-100">
			<slot />
		</p>
		<div class="flex justify-between items-center gap-1 text-left text-gray-500 sm:justify-start sm:flex-row sm:gap-4 md:mb-0 md:text-sm">
			<!-- {JSON.stringify(item.readingTime)} -->
			<p>{stringData}</p>
			{#if item?.readingTime}
				<p class="hidden sm:inline-block">{item?.readingTime}</p>
			{/if}
			<!-- comment this in if you have multiple categories -->
			<span class="px-4 max-h-6 flex items-center capitalize bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-400">
				{item?.category || 'note'}
			</span>
			{#if item?.tags?.length}
			<div class="hidden md:block flex-1">
				{#each item.tags as tag}
					<span class="px-1">
						#{tag}
					</span>
				{/each}
			</div>
			{/if}
			{#if ghMetadata && ghMetadata.reactions.total_count}
				<p class="">{ghMetadata.reactions.total_count} ♥</p>
			{/if}
		</div>
	</div></a
>
