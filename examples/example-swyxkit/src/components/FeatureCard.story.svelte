<!-- https://histoire.dev/guide/svelte3/stories.html -->
<!-- https://histoire.dev/guide/svelte3/controls.html -->
<script>
	import FeatureCard from './FeatureCard.svelte';
	export let Hst;
  let prefixString = "Welcome to "
</script>

<Hst.Story title="FeatureCard" layout={{ type: 'grid', width: '100%' }}>
  <svelte:fragment slot="controls">
    <Hst.Text bind:value={prefixString} title="prefixString" />
  </svelte:fragment>
	<Hst.Variant title="group usage">
		<section class="mb-16 w-full">
			<h3 class="mb-6 text-2xl font-bold tracking-tight text-black dark:text-white md:text-4xl">
				Featured Posts
			</h3>
			<div class="flex flex-col gap-6 md:flex-row">
				<FeatureCard title="Welcome to swyxkit 2022!" href="/welcome" stringData="Jan 2022" />
				<FeatureCard
					title="Moving to a GitHub CMS"
					href="/moving-to-a-github-cms"
					stringData="Jan 2022"
				/>
				<FeatureCard title="HTML Ipsum demo" href="/moo" stringData="Jan 2022" />
			</div>
			<a
				class="mt-8 flex h-6 rounded-lg leading-7 text-gray-600 transition-all dark:text-gray-400 dark:hover:text-gray-200"
				href="/blog"
				>See latest posts<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="ml-1 h-6 w-6"
					><path
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M17.5 12h-15m11.667-4l3.333 4-3.333-4zm3.333 4l-3.333 4 3.333-4z"
					/></svg
				></a
			>
		</section>
	</Hst.Variant>

	<Hst.Variant title="Fast">
    <div class="flex flex-col gap-6 md:flex-row">
      <FeatureCard title={prefixString + " Fast 2022!"} href="/welcome" stringData="Jan 2022" />
    </div>
	</Hst.Variant>
	<Hst.Variant title="Slow">
    <div class="flex flex-col gap-6 md:flex-row">
      <FeatureCard title={prefixString + " Slow 2022!"} href="/welcome" stringData="Jan 2022" />
    </div>
	</Hst.Variant>

</Hst.Story>
