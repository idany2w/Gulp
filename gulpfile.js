const { src, dest, parallel, series, watch } = require('gulp');  // подключаем gulp 
const browserSync = require('browser-sync').create();          // подключаем плагин лайв сервера Browser-Sync
const concat = require('gulp-concat');                    // плагин объединения нескольких файлов в один
const uglify = require('gulp-uglify-es').default;         // сжатие js
const sass = require('gulp-sass');                      // плагин для работы с css-препроцессорами sass и scss
const autoprefixer = require('gulp-autoprefixer');              // название плагина говорит само за себя
const cleancss = require('gulp-clean-css');                 // сжатие, красота для css
const imagemin = require('gulp-imagemin');                  // крутое и простое сжатие изображений
const newer = require('gulp-newer');                     // проверяет новость файлов
const del = require('del');                            // удалятор файлов
const gcmq = require('gulp-group-css-media-queries');           // объединение media запросов CSS

function build() {
    return src(
        [
            'app/css/**/*.min.css',
            'app/js/**/*.min.js',
            'app/img/dist/**/*',
            'app/**/*.html',
        ],
        {
            base: 'app'
        }
    )
        .pipe(dest('dist'));
}

function cleanDist() {
    return del('dist/**/*', { force: true })
}

function bs() {
    browserSync.init({
        server: { baseDir: 'app/' },    //корневая директория сервера
        notify: true,                   //всплывающее уведомление Browser-Sync
        online: true                    //свервер локально или по всей Wi-Fi сети?
    });
}

function scripts() {
    return src([                                    //получаем файлы 
        // 'node_modules/jquery/dist/jquery.min.js',   //подключение jquery
        'app/js/script.js'                          //пользовательские скрипты всегда последние
    ])
        .pipe(concat('app.min.js'))                     //объедиение подключенных js файлов в один с указанным именем
        .pipe(uglify())                                 //сжатие js файлов
        .pipe(dest('app/js/'))                          //выгрузка по указанному пути
        .pipe(browserSync.stream())                     //синхронизация браузера
}

function styles() {
    return src('app/style/main.scss')                //получаем файлы 
        .pipe(sass())                                   //компилируем sass/scss в css
        .pipe(concat('app.min.css'))                    //объединение всех стилей в один
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 5 years'],  //указываем браузеры согласно Browserslist
            grid: true,                                  //автопрефиксы для grid
            flexbox: true                                //автопрефиксы для flex
        }))
        .pipe(gcmq())
        .pipe(cleancss(({
            level: { 1: { specialComments: 0 } }            //полная минификация css 
        })))                                            // группировка media запросов css
        .pipe(dest('app/css/'))                         //выгрузка по указанному пути
        .pipe(browserSync.stream())                     //подмена стилей без перезагрузки страницы
}

function images() {
    return src('app/img/src/**/*')
        .pipe(newer('app/img/dist/'))
        .pipe(imagemin())
        .pipe(dest('app/img/dist/'))
}

function startWatch() {
    watch('app/**/style/**/*', styles);                      //вочим стили
    watch(['app/**/*.js', '!app/**/*.min.js'], scripts);     //вочим скрипты
    watch('app/**/*.html').on('change', browserSync.reload); //вочим html
    watch('app/img/src/**/*', images);                       //вочим картинки
}

exports.bs = bs;
exports.scripts = scripts;
exports.styles = styles;
exports.images = images;
exports.del = del;
exports.build = series(styles, scripts, images, build);

exports.default = parallel(cleanDist, scripts, styles, images, bs, startWatch)