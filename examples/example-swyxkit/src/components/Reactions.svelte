<script>
	/** @type {import('$lib/types').GHReactions} */
	export let reactions;
	/** @type {string} */
	export let issueUrl;
	let emojiMap = {
		'+1': '👍',
		'-1': '👎',
		laugh: '😆',
		hooray: '🎉',
		confused: '😕',
		heart: '❤️',
		rocket: '🚀',
		eyes: '👀'
	};
</script>

<a href={`${issueUrl}#issuecomment-new`} class="no-underline">
	{#each Object.keys(reactions) as reaction}
		{#if Object.keys(emojiMap).includes(reaction) && reactions[reaction] > 0}
			<span class="reaction-button">
				<span class="space-x-1 rounded border-blue-800 p-2">
					<span class="reaction-button-emoji">{emojiMap[reaction]}</span>
					<span class="reaction-button-count">{reactions[reaction]}</span>
				</span>
			</span>
		{/if}
	{/each}
</a>
