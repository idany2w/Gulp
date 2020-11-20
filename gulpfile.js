const { src, dest, parallel, series, watch } = require("gulp"); // подключаем gulp
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

const browsersList = "last 3 versions";

const scss_src = [
	"app/template/css/settings/normalize.scss",
	"app/template/css/settings/magnific.scss",
	"app/template/css/settings/slick.scss",  
	"app/template/css/settings/variables.scss",
	"app/template/css/settings/grid.scss",
	"app/template/css/settings/helpers.scss",
	"app/template/css/style.scss",
	"app/template/css/blocks/*.scss",
]
const css_src = [
    "app/template/css/scss.css"
]
const js_src = [
    "app/template/js/**/*.js",		
    "!app/template/js/script.js", 
    "!app/template/js/script.min.js"
]

function scss() {
	return src(scss_src)
		.pipe(concat("style.scss"))
		.pipe(sass({outputStyle: 'expanded'}))              		//компилируем sass/scss в css
		//css
		.pipe(autoprefixer({overrideBrowserslist: [browsersList]}))
		.pipe(rename("style.css"))
		.pipe(dest("app/template/css/"))

		.pipe(gcmq())												//объединение media запросов CSS
        .pipe(
			cleancss({
				level: { 1: { specialComments: 0 } },				//полная минификация css
			})
		)
        .pipe(rename("style.min.css"))                              //выгружаем сжатый файл
		.pipe(dest("app/template/css/"))							//выгрузка по указанному пути		
		.pipe(browserSync.stream());								//синхронизация браузера
}
function js() {
    return src(js_src)                  //получаем файлы
		.pipe(concat("script.js"))		//объедиение подключенных js файлов в один с указанным именем
		.pipe(dest("app/template/js/"))          //выгружаем несжатый файл
		.pipe(uglify())					//сжатие js файлов
		.pipe(rename("script.min.js"))	//выгружаем сжатый файл
		.pipe(dest("app/template/js/"))			//выгрузка по указанному пути
		.pipe(browserSync.stream());	//синхронизация браузера
}

function bs() {
	browserSync.init({
		server: {
			baseDir: "app/",						//корневая директория сервера
			index: "index.html",					//индексный файл
		},
		notify: true,								//всплывающее уведомление Browser-Sync
		online: true,								//свервер локально или по всей Wi-Fi сети?
	});
}

function startWatch() {
    //вочим стили
    watch(scss_src, scss);

    //вочим скрипты
    watch(js_src, js);		

    //вочим html	
	watch("app/*.html").on("change", browserSync.reload);	
}

exports.js = js;
exports.scss = scss;

exports.bs = bs;

exports.compile = series(scss, js);
exports.default = parallel(series(scss, js), bs, startWatch)