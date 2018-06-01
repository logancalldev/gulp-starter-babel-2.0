# Yarn, Gulp, Babel, BrowserSync, Sass, Cachebusting, Linting

>This is no longer maintained. I'd recommend using this instead, https://github.com/SeaMonster-Studios/webpack-proxy-starter

## Get Started
1. Make sure you have the following npm modules installed globally
	* yarn
	* gulp
	* babel
	* eslint
	* stylelint
2. Run `yarn` to install all dependencies
3. Take a look at the config.json, update the vhost and other variables to your liking
4. Run `gulp` to compile/minify/generate your files and to start live-reloading

### This gulp-starter does the following:
* Compiles ESNext into ES5 (JavaScript).
* Compiles Sass into CSS
* Minifies images (loseless)
* Creates iconfont based on SVGs
* Livereloading on changes to source Typescript and Sass files
* Cachebusts CSS, JS, and iconfont files
* Linting Sass with Stylint (for better in-editor hinting, install the plugin for your code editor)
* Linting JS (for better in-editor hinting, install the plugin for your code editor)
* Scss and JS sourcemaps, so that you know which file errors occur in – not just it's location in the bundled file

