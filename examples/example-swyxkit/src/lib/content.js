import {compile} from 'mdsvex';
import {dev} from '$app/environment';
import grayMatter from 'gray-matter';
import {
    GH_USER_REPO, APPROVED_POSTERS_GH_USERNAME, GH_PUBLISHED_TAGS, REPO_OWNER
} from './siteConfig';
import parse from 'parse-link-header';
import {remark} from 'remark';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import rehypeStringify from 'rehype-stringify';
import rehypeSlug from 'rehype-slug';
import rehypeAutoLink from 'rehype-autolink-headings';

import remarkToc from 'remark-toc';
import remarkGithub from 'remark-github';
import remarkGfm from 'remark-gfm';

const remarkPlugins = [remarkToc, [remarkGithub, {repository: 'https://github.com/swyxio/swyxkit/'}], [remarkGfm, {repository: 'https://github.com/swyxio/swyxkit/'}],];
const rehypePlugins = [rehypeStringify, rehypeSlug, [rehypeAutoLink, {
    behavior: 'wrap', properties: {class: 'hover:text-yellow-100 no-underline'}
}]];

/** @type {import('./types').ContentItem[]} */
let allBlogposts = [];

// let etag = null // todo - implmement etag header

/**
 * @param {string | number} text
 * @returns {string}
 */
function slugify(text) {
    return text
        .toString()                 // Cast to string (optional)
        .normalize('NFKD')          // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
        .toLowerCase()              // Convert the string to lowercase letters
        .trim()                     // Remove whitespace from both sides of a string (optional)
        .replace(/\s+/g, '-')       // Replace spaces with hyphen
        .replace(/[^\w-]+/g, '')   // Remove all non-word chars
        .replace(/--+/g, '-')     // Replace multiple hyphen with single hyphen
        .replace(/(^-|-$)/g, ''); // Remove leading or trailing hyphen
}

/**
 * @param {string} text
 * @returns {string}
 */
function readingTime(text) {
    let minutes = Math.ceil(text.trim().split(' ').length / 225);
    return minutes > 1 ? `${minutes} minutes` : `${minutes} minute`;
}


/**
 * @param {Function} providedFetch from sveltekit
 * @returns {Promise<import('./types').ContentItem[]>}
 */
export async function listContent(providedFetch) {
    // use a diff var so as to not have race conditions while fetching
    // TODO: make sure to handle this better when doing etags or cache restore

    /** @type {import('./types').ContentItem[]} */
    let _allBlogposts = [];
    let next = null;
    let limit = 0; // just a failsafe against infinite loop - feel free to remove
    const authheader = process.env.GH_TOKEN && {
        Authorization: `token ${process.env.GH_TOKEN}`
    };
    let url = `https://api.github.com/repos/${GH_USER_REPO}/issues?` + new URLSearchParams({
        state: 'all', labels: GH_PUBLISHED_TAGS.toString(), per_page: '100',
    });
    // pull issues created by owner only if allowed author = repo owner
    if (APPROVED_POSTERS_GH_USERNAME.length === 1 && APPROVED_POSTERS_GH_USERNAME[0] === REPO_OWNER) {
        url += '&' + new URLSearchParams({creator: REPO_OWNER});
    }
    do {
        const res = await providedFetch(next?.url ?? url, {
            headers: authheader
        });

        const issues = await res.json();
        if ('message' in issues && res.status > 400) throw new Error(res.status + ' ' + res.statusText + '\n' + (issues && issues.message));
        issues.forEach(/** @param {import('./types').GithubIssue} issue */(issue) => {
            if (// labels check not needed anymore as we have set the labels param in github api
                // issue.labels.some((label) => GH_PUBLISHED_TAGS.includes(label.name)) &&
                APPROVED_POSTERS_GH_USERNAME.includes(issue.user.login)) {
                _allBlogposts.push(parseIssue(issue));
            }
        });
        const headers = parse(res.headers.get('Link'));
        next = headers && headers.next;
    } while (next && limit++ < 1000); // just a failsafe against infinite loop - feel free to remove
    _allBlogposts.sort((a, b) => b.date.valueOf() - a.date.valueOf()); // use valueOf to make TS happy https://stackoverflow.com/a/60688789/1106414
    allBlogposts = _allBlogposts;
    return _allBlogposts;
}


function renderWithFootnotes(content) {
    // Regular expression to match footnote references
    const footnoteRefRegex = /\[\^(\w+)\]/g;

    // Regular expression to match footnote content
    const footnoteContentRegex = /\[\^(\w+)\]:\s*(.*)/g;

    // Storing footnote content in a Object
    const footnotes = {};

    // Find and store footnote content
    content = content.replace(footnoteContentRegex, (_, index, text) => {
        footnotes[index] = text;
        return '';
    });

    // Replace footnote references with HTML markup
    content = content.replace(footnoteRefRegex, (_, index) => {
        const footnoteText = footnotes[index];
        if (footnoteText) {
            return `<sup><a href="#fn${index}" id="fnref${index}">${index}</a></sup>`;
        } else {
            return _; // If no corresponding content is found, keep the reference as is
        }
    });

    // Generate the HTML for the footnotes section
    let footnotesHTML = '<hr><section class="footnotes"><ol>';
    for (const index in footnotes) {
        let footNoteContent = footnotes[index]
        footnotesHTML += `<li id="fn${index}">${footNoteContent} <a href="#fnref${index}" title="Jump back to reference">↩</a></li>`;
    }
    footnotesHTML += '</ol></section>';

    // Append the footnotes section to the content
    content += footnotesHTML;

    return content;
}

/**
 * @param {Function} providedFetch from sveltekit
 * @param {string} slug of the file to retrieve
 * @returns {Promise<import('./types').ContentItem[]>}
 */
export async function getContent(providedFetch, slug) {
    // get all blogposts if not already done - or in development
    if (dev || allBlogposts.length === 0) {
        console.log('loading allBlogposts');
        allBlogposts = await listContent(providedFetch);
        console.log('loaded ' + allBlogposts.length + ' blogposts');
        if (!allBlogposts.length) throw new Error('failed to load blogposts for some reason. check token' + process.env.GH_TOKEN);
    }
    if (!allBlogposts.length) throw new Error('no blogposts');
    // find the blogpost that matches this slug
    const blogpost = allBlogposts.find((post) => post.slug === slug);
    if (blogpost) {
        const blogbody = blogpost.content
            .replace(/\n{% youtube (.*?) %}/g, (_, x) => {
                // https://stackoverflow.com/a/27728417/1106414
                function youtube_parser(url) {
                    var rx = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|&v(?:i)?=))([^#&?]*).*/;
                    if (url.match(rx)) return url.match(rx)[1];
                    return url.slice(-11);
                }

                const videoId = x.startsWith('https://') ? youtube_parser(x) : x;
                return `<iframe
			class="w-full object-contain"
			srcdoc="
				<style>
				    body, .youtubeembed {
					width: 100%;
					height: 100%;
					margin: 0;
					position: absolute;
					display: flex;
					justify-content: center;
					object-fit: cover;
				    }
				</style>
				<a
				    href='https://www.youtube.com/embed/${videoId}?autoplay=1'
				    class='youtubeembed'
				>
				    <img
					src='https://img.youtube.com/vi/${videoId}/sddefault.jpg'
					class='youtubeembed'
				    />
				    <svg
					version='1.1'
					viewBox='0 0 68 48'
					width='68px'
					style='position: relative;'
				    >
					<path d='M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z' fill='#f00'></path>
					<path d='M 45,24 27,14 27,34' fill='#fff'></path>
				    </svg>
				</a>
			"
			title="video123"
			name="video123"
			allow="accelerometer; autoplay; encrypted-media; gyroscope;
			picture-in-picture"
			frameBorder="0"
			webkitallowfullscreen="true"
			mozallowfullscreen="true"
			width="600"
			height="400"
			allowFullScreen
			aria-hidden="true"></iframe>`;
            })
            .replace(/\n{% (tweet|twitter) (.*?) %}/g, (_, _2, x) => {
                const url = x.startsWith('https://twitter.com/') ? x : `https://twitter.com/x/status/${x}`;
                return `
					<blockquote class="twitter-tweet" data-lang="en" data-dnt="true" data-theme="dark">
					<a href="${url}"></a></blockquote> 
					<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
					`;
            });


        // footnotes
        const blogbodyWithFootNotes = renderWithFootnotes(blogbody);

        // compile it with mdsvex
        const content = (await compile(blogbodyWithFootNotes, {
                remarkPlugins, // @ts-ignore
                rehypePlugins
            })).code
            // https://github.com/pngwn/MDsveX/issues/392
            .replace(/>{@html `<code class="language-/g, '><code class="language-')
            .replace(/<\/code>`}<\/pre>/g, '</code></pre>');

        return {...blogpost, content};
    } else {
        throw new Error('Blogpost not found for slug: ' + slug);
    }
}

/**
 * @param {import('./types').GithubIssue} issue
 * @returns {import('./types').ContentItem}
 */
function parseIssue(issue) {
    const src = issue.body;
    const {content, data} = grayMatter(src);
    let title = data.title ?? issue.title;
    let slug;
    if (data.slug) {
        slug = data.slug;
    } else {
        slug = slugify(title);
    }
    let description = data.description ?? content.trim().split('\n')[0];
    // extract plain text from markdown
    description = remark()
        .use(remarkParse)
        .use(remarkStringify)
        .processSync(description)
        .toString();
    description = description.replace(/\n/g, ' ');
    // strip html
    description = description.replace(/<[^>]*>?/gm, '');
    // strip markdown
    // description = description.replace(/[[\]]/gm, '');

    // you may wish to use a truncation approach like this instead...
    // let description = (data.content.length > 300) ? data.content.slice(0, 300) + '...' : data.content

    /** @type {string[]} */
    let tags = [];
    if (data.tags) tags = Array.isArray(data.tags) ? data.tags : data.tags.split(',').map(x => x.trim());

    return {
        type: 'blog', // futureproof in case you want to add other types of content
        content,
        frontmatter: data,
        title,
        subtitle: data.subtitle,
        description,
        category: data.category?.toLowerCase() || 'note', // all posts assumed to be "note"s unless otherwise specified
        tags,
        image: data.image ?? data.cover_image,
        canonical: data.canonical, // for canonical URLs of something published elsewhere
        slug: slug.toString().toLowerCase(),
        date: new Date(data.date ?? issue.created_at),
        readingTime: readingTime(content),
        ghMetadata: {
            issueUrl: issue.html_url,
            commentsUrl: issue.comments_url,
            title: issue.title,
            created_at: issue.created_at,
            updated_at: issue.updated_at,
            reactions: issue.reactions
        }
    };
}
