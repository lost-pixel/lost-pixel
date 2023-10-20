import RSS from 'rss';
import { SITE_TITLE, SITE_URL } from '$lib/siteConfig';
import { remark } from 'remark';
import remarkHTML from 'remark-html';
import { listContent } from '$lib/content';

// Reference: https://github.com/sveltejs/kit/blob/master/examples/hn.svelte.dev/src/routes/%5Blist%5D/rss.js
/** @type {import('@sveltejs/kit').RequestHandler} */
export async function GET({ fetch }) {
	const feed = new RSS({
		title: SITE_TITLE + ' RSS Feed',
		site_url: SITE_URL,
		feed_url: SITE_URL + '/api/rss.xml'
	});

	const allBlogs = await listContent(fetch);
	allBlogs.forEach((post) => {


		// extract HTML from markdown
		const htmlDescription = remark()
			.use(remarkHTML)
			.processSync(post.description)

		feed.item({
			title: post.title,
			url: SITE_URL + `/${post.slug}`,
			date: post.date,
			description: htmlDescription.toString()
		});
	});

	// Suggestion (check for correctness before using):
	return new Response(feed.xml({ indent: true }), {
		headers: {
			'Cache-Control': `public, max-age=${86400}`, // 24 hours
			'Content-Type': 'application/rss+xml'
		}
	});
}

// misc notes for future users

// // notes - originally tried to fetch this via /api/listContent.json but...
// // cannot use url.origin because it is null during SSR...
// // const res = await fetch(url.origin + `/api/listContent.json`)

// // cannot use url.protocol because URL scheme "sveltekit" is not supported.
// // const res = await fetch(`${url.protocol}//${url.host}/api/listContent.json`);
// // const allBlogs = await res.json();

// 	// use this if you want your content in a local '/content' folder rather than github issues
// 	// let allBlogs = import.meta.globEager('/content/**/*.md')
// 	Object.entries(allBlogs).forEach(([path, obj]) => {
// 		feed.item({
// 			title: obj.title,
// 			url: SITE_URL + `/${path.slice(9).slice(0, -3)}`,
// 			date: obj.date,
// 			description: obj.description
// 		});
// 	});
