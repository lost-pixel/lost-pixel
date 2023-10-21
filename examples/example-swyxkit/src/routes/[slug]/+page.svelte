<script>
	import { MY_TWITTER_HANDLE, SITE_URL } from '$lib/siteConfig';
	// import Comments from '../../components/Comments.svelte';

	import 'prism-themes/themes/prism-shades-of-purple.min.css';
	import Newsletter from '../../components/Newsletter.svelte';
	import Reactions from '../../components/Reactions.svelte';
	import LatestPosts from '../../components/LatestPosts.svelte';
	import { page } from '$app/stores';


	// https://svelte-put.vnphanquang.com/docs/toc
  import { toc, createTocStore } from '@svelte-put/toc';
	import TableOfContents from './TableOfContents.svelte';
	import utterances, {injectScript}  from './loadUtterances'

	// table of contennts
  const tocStore = createTocStore();


	/** @type {import('./$types').PageData} */
	export let data;
	
	/** @type {import('$lib/types').ContentItem} */
	$: json = data.json; // warning: if you try to destructure content here, make sure to make it reactive, or your page content will not update when your user navigates

	export let commentsEl;
	$: issueNumber = json?.ghMetadata?.issueUrl?.split('/')?.pop()

	$: canonical =  json?.canonical ? json.canonical : SITE_URL + $page.url.pathname;

	// customize this with https://tailgraph.com/
	// discuss this decision at https://github.com/sw-yx/swyxkit/pull/161
	$: image = json?.image || `https://og.tailgraph.com/og
															?fontFamily=Roboto
															&title=${encodeURIComponent(json?.title)}
															&titleTailwind=font-bold%20bg-transparent%20text-7xl
															&titleFontFamily=Poppins
															${json?.subtitle ? '&text='+ encodeURIComponent(json?.subtitle) : ''}
															&textTailwind=text-2xl%20mt-4
															&logoTailwind=h-8
															&bgUrl=https%3A%2F%2Fwallpaper.dog%2Flarge%2F20455104.jpg
															&footer=${encodeURIComponent(SITE_URL)}
															&footerTailwind=text-teal-900
															&containerTailwind=border-2%20border-orange-200%20bg-transparent%20p-4
															`.replace(/\s/g,'') // remove whitespace

</script>

<svelte:head>
	<title>{json.title}</title>
	<!-- reference: https://gist.github.com/whitingx/3840905 -->

	<link rel="canonical" href={canonical} />
	<meta property="og:url" content={canonical} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={json.title} />
	{#if json.subtitle}
		<meta property="subtitle" content={json.subtitle} />
	{/if}
	<meta name="Description" content={json.description || 'swyxkit blog'} />
	<meta property="og:description" content={json.description || 'swyxkit blog'} />
	<meta name="twitter:card" content={json.image ? 'summary_large_image' : 'summary'} />
	<meta name="twitter:creator" content={'@' + MY_TWITTER_HANDLE} />
	<meta name="twitter:title" content={json.title} />
	<meta name="twitter:description" content={json.description} />
	<meta property="og:image" content={image} />
	<meta name="twitter:image" content={image} />
</svelte:head>

<TableOfContents {tocStore} />

<article use:toc={{ store: tocStore, anchor: false, observe: true, selector: ':where(h1, h2, h3)' }} class="items-start justify-center w-full mx-auto mt-16 mb-32 prose swyxcontent dark:prose-invert max-w-none">
	<h1 class="md:text-center mb-8 text-3xl font-bold tracking-tight text-black dark:text-white md:text-5xl ">
		{json.title}
	</h1>
	<div
		class="flex justify-between w-full mt-2 bg border-red sm:items-start md:flex-row md:items-center"
	>
		<p class="flex items-center text-sm text-gray-700 dark:text-gray-300">swyx</p>
		<p class="flex items-center text-sm text-gray-600 dark:text-gray-400">
			<a href={json.ghMetadata.issueUrl} rel="external noreferrer" class="no-underline" target="_blank">
				<!-- <span class="mr-4 font-mono text-xs text-gray-700 text-opacity-70 dark:text-gray-300"
					>{json.ghMetadata.reactions.total_count} reactions</span
				> -->
				{new Date(json.date).toISOString().slice(0, 10)}
			</a>
		</p>
	</div>
	<div
		class="-mx-4 my-2 flex h-1 w-[100vw] bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 sm:mx-0 sm:w-full"
	/>
	{@html json.content}
</article>

<div class="max-w-2xl mx-auto">
	{#if json?.tags?.length}
		<p class="!text-slate-400 flex-auto mb-4 italic">
			Tagged in: 
			{#each json.tags as tag}
				<span class="px-1">
					<a href={`/blog?filter=hashtag-${tag}`}>#{tag}</a>
				</span>
			{/each}
		</p>
	{/if}
	<div class="max-w-full p-4 mb-12 prose border-t border-b border-blue-800 dark:prose-invert">
		{#if json.ghMetadata.reactions.total_count > 0}
			Reactions: <Reactions
				issueUrl={json.ghMetadata.issueUrl}
				reactions={json.ghMetadata.reactions}
			/>
		{:else}
			<a href={json.ghMetadata.issueUrl}>Leave a reaction </a>
			if you liked this post! 🧡
		{/if}
	</div>
	<div class="mb-8 text-black dark:text-white " bind:this={commentsEl} use:utterances={{number: issueNumber}}>
		Loading comments...
		<!-- svelte-ignore a11y-mouse-events-have-key-events -->
		<button class="my-4 bg-blue-200 hover:bg-blue-100 text-black p-2 rounded-lg" 
			on:click={() => injectScript(commentsEl, issueNumber)}
			on:mouseover={() => injectScript(commentsEl, issueNumber)}
		>Load now</button>
		<!-- <Comments ghMetadata={json.ghMetadata} /> -->
	</div>

	<Newsletter />
	<LatestPosts items={data.list} />
</div>

<style>
	/* https://ryanmulligan.dev/blog/layout-breakouts/ */
		.swyxcontent {
			--gap: clamp(1rem, 6vw, 3rem);
			--full: minmax(var(--gap), 1fr);
			/* --content: min(65ch, 100% - var(--gap) * 2); */
			--content: 65ch;
			--popout: minmax(0, 2rem);
			--feature: minmax(0, 5rem);

			display: grid;
			grid-template-columns: 
				[full-start] var(--full)
				[feature-start] 0rem
				[popout-start] 0rem
				[content-start] var(--content) [content-end]
				[popout-end] 0rem
				[feature-end] 0rem
				var(--full) [full-end]
		}

		@media (min-width: 768px) {
			.swyxcontent {
				grid-template-columns:
					[full-start] var(--full)
					[feature-start] var(--feature)
					[popout-start] var(--popout)
					[content-start] var(--content) [content-end]
					var(--popout) [popout-end]
					var(--feature) [feature-end]
					var(--full) [full-end];
			}
		}

	:global(.swyxcontent > *) {
		grid-column: content;
	}

	article :global(pre) {
		grid-column: feature;
		margin-left: -1rem;
		margin-right: -1rem;
	}

	/* hacky thing because otherwise the summary>pre causes overflow */
	article :global(summary > pre) {
		max-width: 90vw;
	}

	article :global(.popout) {
		grid-column: popout;
	}
	article :global(.feature) {
		grid-column: feature;
	}
	article :global(.full) {
		grid-column: full;
		width: 100%;
	}

	article :global(.admonition) {
		@apply p-8 border-4 border-red-500;
	}

	/* fix github codefence diff styling from our chosen prismjs theme */
	article :global(.token.inserted) {
		background: #00ff0044;
	}

	article :global(.token.deleted) {
		background: #ff000d44;
	}
</style>
