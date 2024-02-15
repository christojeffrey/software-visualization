module.exports = {
	rules: {
		// allow explicit any
		// '@typescript-eslint/no-explicit-any': 'off',
		// allow unused vars
		'@typescript-eslint/no-unused-vars': 'off',
		// allow ts-ignore pragma
		'@typescript-eslint/ban-ts-comment': 'off'
	},
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'prettier'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte']
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		}
	]
};
