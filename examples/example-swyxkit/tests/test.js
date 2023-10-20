import { expect, test } from '@playwright/test';

test('about page has expected h1', async ({ page }) => {
	await page.goto('/about');
	expect(await page.textContent('h1')).toBe('About swyxkit!');
});

test.describe('test blog page', () => {
	test('blog page to preserve url params', async ({ page }) => {
		// Go to http://localhost:4173/
		await page.goto('/blog');

		// Click [placeholder="Hit \/ to search"]
		await page.locator('[placeholder="Hit \\/ to search"]').click();

		// Fill [placeholder="Hit \/ to search"]
		await page.locator('[placeholder="Hit \\/ to search"]').fill('test');
		await expect(page).toHaveURL('http://localhost:4173/blog?filter=test');

		// Click label:has-text("Blog")
		await page.locator('label:has-text("Blog")').click();
		await expect(page).toHaveURL('http://localhost:4173/blog?filter=test&show=Blog');
	});

	test('blog to honour existing params', async ({ page }) => {
		await page.goto('http://localhost:4173/blog?filter=test&show=Blog');
		await expect(page).toHaveURL('http://localhost:4173/blog?filter=test&show=Blog');
	});
});
