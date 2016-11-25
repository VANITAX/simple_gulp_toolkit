var gulp           = require('gulp');
var changed        = require('gulp-changed');
var autoprefixer   = require('gulp-autoprefixer')
var jade           = require('gulp-jade');
var compass        = require('gulp-compass');
var sass           = require('gulp-ruby-sass');
var gutil          = require('gulp-util');
var del            = require('del');
var browserSync    = require('browser-sync');
var merge          = require('merge-stream');
var plumber        = require('gulp-plumber');
var gulpLiveScript = require('gulp-livescript');
var notify         = require("gulp-notify");
var reload         = browserSync.reload;
//  編譯來源位置
var sources = {
  config: './src/config/*.js',
  js: './src/javascript/**/*.js',
  icon: './src/assets/icon/',
  sprite: './src/assets/stylesheets/icon/',
  sass: './src/sass/**/*.sass',
  jade: './src/view/*.jade',
  lib: './src/assets/'
};

//  編譯完成位置
var destinations = {
  js: './build/javascripts/app',
  vendor: './build/javascripts',
  css: './build/stylesheets',
  html: './build/',
  root: './build/'
};

var libPath = [
    sources.lib + 'stylesheets/vendor/reset/*' ,
    sources.lib + 'images/**' ,
    sources.lib + 'fonts/**' ,
    // sources.lib + 'config/**' ,
    // sources.lib + 'javascripts/lib/*.js' ,
  ];

var syncOPT = {
  logPrefix: "Server",
  browser: "google chrome",
  // open: "external",
  open: false,
  reloadDelay: 1000,
  index: "index.html",
  // https: true,
  // host: "192.168.1.111",
  // logLevel: "debug",
  server: {
    baseDir: './build/'
  },
  port: 8080,
  watchOptions: {debounceDelay: 1000}
}

var compassOPT = {
  // config_file: 'config.rb',
  css: 'build/stylesheets',
  sass: 'src/sass',
  sourcemap: false,
  comments: false,
  debug: false,
  logging: true,
  task: "watch",
  time: true,
  // import_path: false,
  require: ['susy', 'breakpoint']
}

// 清除目標
// if string have the prefix '!', that file or folder won't be deleted.
var cleanArray = [
  './build/*'
];

// Error handeler
// 通知中心錯誤彈出設定
var onError = function (err) {
    console.log('=-=-=-=-=-=-=-=-=-=ERROR_MESSAGE-=-=-=-=-=-=-=-=-=-=-');
    console.log('/////////////////////////////////////////////////////');
    notify.onError({})(err);
    gutil.log(gutil.colors.yellow(err.message));
    console.log('///////////////////ERROR_MESSAGE/////////////////////');
    //gutil.beep();
    browserSync.notify(err.message, 5000);
    return notify(err.message);
};


// 處理 build 初始化的功能
// Clean all of compiled files
gulp.task('clean', function() {
  del.sync(cleanArray)
});

// 處理js
gulp.task('js', function() {
  return gulp.src(sources.js)
  // 檢查js語法
    .on('error', function(err){
      //do whatever here
      // console.log("You have something wrong? Check your js")
      browserSync.notify(err.message, 5000);
      this.end();
    })
    // 輸出
    .pipe(gulp.dest(destinations.js))
});


// Compass Compile
gulp.task('compass', function() {
    var stream = gulp.src(sources.sass)
    .pipe(compass(compassOPT))
    .on('error' , function (err) {
      console.log('/////////////////////////////////////////////////////');
      console.log('=-=-=-=-=-=-=-=-=-=ERROR_MESSAGE-=-=-=-=-=-=-=-=-=-=-');
      // gutil.log(gutil.colors.yellow(err.message));
      notify.onError({
        title:    "something wrong?",
        // subtitle: "Error: <%= error.message %>",
        message:  "Error: <%= error.message %>",
        sound:    "Frog"
      })(err);
      console.log('=-=-=-=-=-=-=-=-=-=ERROR_MESSAGE-=-=-=-=-=-=-=-=-=-=-');
      console.log('/////////////////////////////////////////////////////');
      // gutil.beep();
      browserSync.notify(err.message, 5000);
      stream.end();
    })
    // .pipe(postcss([ autoprefixer({ browsers: ['last 2 versions', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'] }) ]))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    // .pipe(rename({
    //   suffix: '-min',
    // }))
    .pipe(gulp.dest(destinations.css))
    .pipe(reload({stream:true}));
    return stream;
});

// Jade Compile
gulp.task('jade', function() {
  // var YOUR_LOCALS = {};
  var all = gulp.src(sources.jade)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(changed(destinations.html, {extension: '.html'}))
    // locals: YOUR_LOCALS,
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(destinations.html));

  var index = gulp.src(sources.jade)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(destinations.html));
  // return merge(all, index);
  return merge(index);
});


// Get the library code to build directory
gulp.task('get-lib', function() {
  return gulp.src(libPath, {base: sources.lib})
    .pipe(gulp.dest(destinations.root));
});

// Run Server
gulp.task('browser-sync', ['build'], function() {
  browserSync(syncOPT)
});

// Watch files
gulp.task('watch', function() {
  gulp.watch(sources.config, ['config'])
  gulp.watch(sources.js, ['js'])
  // .on("change", function(file) {
  //   browserSync.reload()
  // });
  gulp.watch(sources.sass, ['compass']);
  gulp.watch(sources.jade, ['jade']);
});


// Livereload
var watchfolder = ['./build/*.html','./build/**/*.js' ]
gulp.task('livereload',['watch', 'browser-sync'], function() {
  gulp.watch( watchfolder, function(file) {
    if(file.type === 'changed')
      return reload(file.path);
  });
});

gulp.task('bs-reload', function () {
  reload();
});


// Compile to HTML, CSS, JavaScript
gulp.task('compile', ['clean', 'get-lib' ,'compass' , 'jade', 'js' ]);
gulp.task('build',['compile']);

gulp.task('default',['build', 'livereload']);
