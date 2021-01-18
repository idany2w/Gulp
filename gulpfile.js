const { src, dest, parallel, series, watch, lastRun } = require("gulp"); // подключаем gulp
const browserSync = require("browser-sync").create();			// подключаем плагин лайв сервера Browser-Sync
const concat = require("gulp-concat");							// плагин объединения нескольких файлов в один
const uglify = require("gulp-uglify-es").default;				// сжатие js
const sass = require("gulp-sass");								// плагин для работы с css-препроцессорами sass и scss
const autoprefixer = require("gulp-autoprefixer");				// название плагина говорит само за себя
const cleancss = require("gulp-clean-css");						// сжатие, красота для css
const imagemin = require("gulp-imagemin");						// крутое и простое сжатие изображений
const newer = require("gulp-newer");							// проверяет новость файлов
const del = require("del");										// удалятор файлов
const gcmq = require("gulp-group-css-media-queries");			// объединение media запросов CSS
const rename = require("gulp-rename");							// переименовать файлы
const pug = require('gulp-pug');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const cached = require('gulp-cached');
const remember = require('gulp-remember');


const browsersList = "last 10 version, ie 11";

const source = {
	js: [	
		"app/template/blocks/**/*.js",
		"app/template/js/**/*.js",		
		"!app/template/js/includes/*",
		"!app/template/js/script.js", 
		"!app/template/js/script.min.js"
	],
	js_includes: [
		"app/template/js/includes/**/*", 
	], 
	scss: [
		/* normalize */
		'app/template/blocks/_base/includes/normalize.scss',
		/* libs */
		'app/template/blocks/_base/includes/magnific.scss',
		'app/template/blocks/_base/includes/slick.scss',
		'app/template/blocks/_base/includes/OverlayScrollbars.min.scss',
		/* defaults */
		'app/template/blocks/_base/includes/variables.scss',
		'app/template/blocks/_base/includes/grid.scss',
		'app/template/blocks/_base/includes/helpers.scss',
		'app/template/blocks/_base/includes/btn.scss',
		'app/template/fonts/fonts.scss',
		'app/template/blocks/_base/includes/typography.scss',
		/* style.scss */
		"app/template/blocks/_base/style.scss",
		/* blocks */
		"app/template/blocks/**/*.scss",
	],
	pug: {
		pages: "app/template/view/*.pug",
		blocks: "app/template/blocks/**/*.pug"
	},
	fonts:"app/template/fonts/**/*",
	images:"app/template/images/**/*"
}

function scss() {
	return src(source.scss)
		.pipe(concat("style.scss"))
		.pipe(dest("dist/template/scss/"))
		.pipe(sass({outputStyle: 'expanded'}))              		//компилируем sass/scss в css
		//css
		.pipe(autoprefixer({
			overrideBrowserslist: [browsersList]
		}))
		.pipe(rename("style.css"))
		.pipe(dest("dist/template/css/"))
		.pipe(browserSync.stream())								    //синхронизация браузера
		.pipe(gcmq())												//объединение media запросов CSS
        .pipe(
			cleancss({
				level: { 1: { specialComments: 0 } },				//полная минификация css
			})
		)
        .pipe(rename("style.min.css"))                              //выгружаем сжатый файл
		.pipe(dest("dist/template/css/"))							//выгрузка по указанному пути		
		.pipe(browserSync.stream());								//синхронизация браузера
}

function js() {
	return src(source.js)                  //получаем файлы
		.pipe(sourcemaps.init())
		.pipe(concat("script.js"))		//объедиение подключенных js файлов в один с указанным именем
		.pipe(sourcemaps.write())
		.pipe(babel({
			presets: ['@babel/env']
		}))
		.pipe(dest("dist/template/js/"))//выгружаем несжатый файл
		.pipe(uglify())					//сжатие js файлов
		.pipe(rename("script.min.js"))	//выгружаем сжатый файл
		.pipe(dest("dist/template/js/"))//выгрузка по указанному пути
		.pipe(browserSync.stream());	//синхронизация браузера
}
function js_includes() {
	return src(source.js_includes)
	.pipe(dest("dist/template/js/includes"))//выгрузка по указанному пути
	.pipe(browserSync.stream());	//синхронизация браузера
}

function pug_pages() {
	return src(source.pug.pages, { since: lastRun('pug_pages') })
	.pipe(cached('pug_pages'))
	.pipe(pug({pretty:true, doctype:'HTML'}))
    .pipe(remember('pug_pages'))
	.pipe(dest('dist/'))
}

function bs() {
	browserSync.init({
		server: {
			baseDir: "dist/",						//корневая директория сервера
			index: "index.html",					//индексный файл
		},
		notify: true,								//всплывающее уведомление Browser-Sync
		online: true								//свервер локально или по всей Wi-Fi сети?
	});
}

function clearstatic() {
	return del([
		"dist/template/fonts/",
		"dist/template/images/",
	])
}

function images(){
	return src(source.images)
	.pipe(dest('dist/template/images/'))
	.pipe(browserSync.stream());	//синхронизация браузера
}
function fonts(){
	return src(source.fonts)
	.pipe(dest('dist/template/fonts/'))
	.pipe(browserSync.stream());	//синхронизация браузера
}

function startWatch() {
    //вочим стили
    watch(source.scss, scss);

    //вочим скрипты
	watch(source.js, js);	
		
    watch(source.pug.blocks, pug_pages);
    watch(source.pug.pages, pug_pages);		

    //вочим html	
	watch("dist/*.html").on("change", browserSync.reload);

	//вочим шрифты и картинки
    watch(source.fonts, fonts);
    watch(source.images, images);
}

exports.js = js;
exports.js_includes = js_includes;
exports.scss = scss;
exports.pug_pages = pug_pages;
exports.bs = bs;
exports.clearstatic = clearstatic;
exports.fonts = fonts;
exports.images = images;

exports.compile = series(pug_pages, scss, js, js_includes, clearstatic, images, fonts);
exports.default = parallel(series(pug_pages, scss, js, js_includes, clearstatic, images, fonts), bs, startWatch)