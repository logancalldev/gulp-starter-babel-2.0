const gulp = require("gulp");
const gutil = require("gulp-util");
const uglify = require("gulp-uglify");
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require("browser-sync").create();
const plumber = require("gulp-plumber");
const sass = require("gulp-sass");
const eslint = require('gulp-eslint');
const rucksack = require("gulp-rucksack");
const cssnano = require("gulp-cssnano");
const rename = require("gulp-rename");
const postcss = require("gulp-postcss");
const stylelint = require("stylelint");
const reporter = require("postcss-reporter");
const syntaxScss = require("postcss-scss");
const stylelintConfig = require("./.stylelintrc.json");
const imagemin = require("gulp-imagemin");
const conf = require("./config.json");
const iconfont = require("gulp-iconfont");
const consolidate = require("gulp-consolidate");
const bust = require("gulp-cache-bust");
const babel = require('gulp-babel');
const eslintConfig = require('./.eslintrc.json');
const concat = require("gulp-concat");

gulp.task("eslint", () => {
	return gulp.src(conf.scriptsToLint)
		.pipe(plumber(function (error) {
			gutil.log(gutil.colors.red(error.message));
			this.emit("end");
		}))
		.pipe(eslint(eslintConfig))
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task("scripts-inline", ["eslint"], () => {
	return gulp.src(conf.scriptsInline)
		.pipe(babel({
			presets: ["es2015", "stage-0"]
		}))
		.pipe(plumber(function (error) {
			gutil.log(gutil.colors.red(error.message));
			this.emit("end");
		}))
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(uglify())
		.pipe(concat("inline.js"))
		.pipe(bust())
		.pipe(sourcemaps.write("./"))
		.pipe(gulp.dest(conf.dist + "js/"))
		.pipe(browserSync.stream());
});

gulp.task("scripts", ["scripts-inline"], () => {
	return gulp.src(conf.scripts)
		.pipe(babel({
			presets: ["es2015", "stage-0"]
		}))
		.pipe(plumber(function (error) {
			gutil.log(gutil.colors.red(error.message));
			this.emit("end");
		}))
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(uglify())
		.pipe(concat("index.js"))
		.pipe(bust())
		.pipe(sourcemaps.write("./"))
		.pipe(gulp.dest(conf.dist + "js/"))
		.pipe(browserSync.stream());
});

gulp.task("sass-lint", () => {
	const processors = [
		stylelint(stylelintConfig),
		reporter({
			clearMessages: true,
			throwError: true,
		}),
	];

	return gulp.src(conf.sassFilesToLint)
		.pipe(plumber(function (error) {
			gutil.log(gutil.colors.red(error.message));
			this.emit("end");
		}))
		.pipe(postcss(processors, { syntax: syntaxScss }));
});

gulp.task("styles", ["sass-lint"], () => {
	return gulp.src(conf.sassIndex)
		.pipe(plumber(function (error) {
			gutil.log(gutil.colors.red(error.message));
			this.emit("end");
		}))
		.pipe(sourcemaps.init())
		.pipe(sass().on("error", sass.logError))
		.pipe(rucksack({ autoprefixer: true }))
		.pipe(cssnano())
		.pipe(rename((path) => path.basename += ".min"))
		.pipe(bust())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(conf.dist + "css/"))
		.pipe(browserSync.stream());
});

gulp.task("watch", ["scripts", "styles"], () => {
	// Serve files from this project"s virtual host that has been configured with the server rendering this site
	browserSync.init({
		files: [
			{
				options: {
					ignored: ".*",
				},
			},
		],
		port: 8181,
		logPrefix: conf.vhost,
		notify: false,
		proxy: conf.vhost,
		reloadOnRestart: true,
	});

	gulp.watch(["source/scripts/**"], ["scripts"]);
	gulp.watch(["source/scripts/inline/**"], ["scripts"]).on("change", browserSync.reload);
	gulp.watch(["source/styles/**"], ["styles"]);
	gulp.watch(["source/styles/inline/**", "source/styles/inline.scss"], ["styles"]).on("change", browserSync.reload);
	gulp.watch([conf.watchedViews]).on("change", browserSync.reload);
});

gulp.task("images", () => {
	return gulp.src("source/images/**")
		.pipe(imagemin({
			interlaced: true,
			progressive: true,
			svgoPlugins: [{ removeUnknownsAndDefaults: false }, { cleanupIDs: false }]
		}))
		.pipe(gulp.dest(conf.dist + "images/"));
});

// reference for svg setup: https://github.com/nfroidure/gulp-iconfont
gulp.task("iconfonts", () => {
	return gulp.src("source/fonts/icons/svg/**")
		.pipe(plumber(function (error) {
			gutil.log(gutil.colors.red(error.message));
			this.emit("end");
		}))
		.pipe(iconfont({
			fontName: "website-icons",
			timestamp: Date.now()
		}))
		.on("glyphs", function (glyphs) {
			gulp.src("source/fonts/icons/iconfont.template")
				.pipe(plumber(function (error) {
					gutil.log(gutil.colors.red(error.message));
					this.emit("end");
				}))
				.pipe(consolidate("lodash", {
					className: "icon",
					fontName: "website-icons",
					fontPath: "../fonts/",
					glyphs: glyphs,
					timestamp: Date.now(),
				}))
				.pipe(rename("iconfont.scss"))
				.pipe(gulp.dest("source/styles/index/"));
		})
		.pipe(gulp.dest(conf.dist + "fonts"));
});

gulp.task("fonts", ["iconfonts"], () => {
	// in case we have other font libraries that need to be but in assets... put them here and then they'll get copied over
	return gulp.src("source/fonts/vendor/**")
		.pipe(gulp.dest(conf.dist + "fonts"));
});

gulp.task("default", ["images", "fonts", "watch"]);
