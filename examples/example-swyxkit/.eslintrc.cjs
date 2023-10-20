module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: [
		'eslint:recommended',
		// 'plugin:@typescript-eslint/recommended',  // todo: https://stackoverflow.com/questions/57597142/how-to-run-typescript-eslint-on-ts-files-and-eslint-on-js-files-in-the-same-pr
		'prettier'
	],
	plugins: ['svelte3', '@typescript-eslint'],
	ignorePatterns: ['*.cjs'],
	overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
	settings: {
		'svelte3/typescript': () => require('typescript')
	},
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2019
	},
	rules: {
		"no-unused-expressions": "warn",
		"no-constant-binary-expression": "warn",
		"no-sequences": "warn",
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	}
};
