import { readFileSync, writeFileSync } from 'node:fs';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { log } from './log';
import { type PageScreenshotParameter } from './config';

type SitemapParserOptions = {
  outputPath: string;
};

type SitemapUrlEntry = {
  loc: string[];
  lastmod: string[];
};

type Sitemap = {
  urlset: {
    $: {
      xmlns: string;
    };
    url: SitemapUrlEntry[];
  };
};

async function fetchSitemap(url: string): Promise<string> {
  if (url.startsWith('http')) {
    const response = await axios.get(url);

    return response.data as string;
  }

  return readFileSync(url, 'utf8');
}

async function parseSitemap(sitemapContent: string): Promise<string[]> {
  const result: Sitemap = (await parseStringPromise(sitemapContent)) as Sitemap;

  if (!result.urlset || !Array.isArray(result.urlset.url)) {
    throw new Error('Invalid sitemap format');
  }

  return result.urlset.url
    .filter(
      (urlEntry: SitemapUrlEntry) => urlEntry.loc && urlEntry.loc.length > 0,
    )
    .map((urlEntry: SitemapUrlEntry) => urlEntry.loc[0]);
}

async function generatePagesFileFromSitemap(
  url: string,
  options: SitemapParserOptions,
): Promise<void> {
  try {
    const sitemapContent = await fetchSitemap(url);
    const urls = await parseSitemap(sitemapContent);

    const pages: PageScreenshotParameter[] = urls.map((url) => {
      const page: PageScreenshotParameter = {
        path: new URL(url).pathname, // Extract the path from the URL
        name: url.replace(/^https?:\/\/(www\.)?|^www\./g, '').replace(/\//g, '_'), // Create a unique name
      };

      return page;
    });

    writeFileSync(options.outputPath, JSON.stringify(pages, null, 2));
    log.process(
      'info',
      'general',
      '✅ Pages file generated successfully at',
      options.outputPath,
    );
  } catch (error) {
    log.process(
      'error',
      'general',
      '❌ Pages file generation errored out. Please check the error message below',
      error,
    );
  }
}

export const generatePagesFromSitemap = async () => {
  const argv = await yargs(hideBin(process.argv))
    .usage('Usage: $0 <command> <sitemapUrl> <outputPath>')
    .command(
      'page-sitemap-gen <sitemapUrl> <outputPath>',
      'Generate pages file from sitemap',
    )
    .demandCommand(1).argv;

  const { sitemapUrl, outputPath } = argv;

  if (
    !sitemapUrl ||
    typeof sitemapUrl !== 'string' ||
    !outputPath ||
    typeof outputPath !== 'string'
  ) {
    log.process(
      'error',
      'general',
      '❌ sitemapUrl and outputPath are required',
    );

    return;
  }

  log.process(
    'info',
    'general',
    `🧬 Running lost-pixel in sitemap-page-gen mode. Pages file will be generated from provided sitemap on ${sitemapUrl}`,
  );
  await generatePagesFileFromSitemap(sitemapUrl, {
    outputPath,
  });
};
