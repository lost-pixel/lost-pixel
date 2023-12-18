const tailwind = require('tailwindcss');
const autoprefixer = require('autoprefixer');

module.exports = {
	plugins: [
		// Some plugins, like postcss-nested, need to run before Tailwind
		tailwind(),
		// But others, like autoprefixer, need to run after
		autoprefixer()
	]
};
