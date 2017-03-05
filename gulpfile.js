/*
 * Copyright (C) Webaggressive Development, 2009-2017
 * Denis Klimov (plitnichenko@gmail.com)
 * -------------------------------------------------------------
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * -------------------------------------------------------------
 */

'use strict';

const
    gulp            = require('gulp'),
    $               = require('gulp-load-plugins')(),
    rimraf          = require('rimraf'),
    runSequence     = require('run-sequence'),
    env             = $.util.env,
    isWatching      = () => $.util.env._.indexOf('watch') > -1,
    path            = {
        src     : {
            css     : './src/less/index.less',
            js      : [
                './node_modules/jquery/dist/jquery.js',
                './node_modules/uikit/dist/js/uikit.js',
                './src/js/index.js'
            ],
            images  : [
                './node_modules/uikit/src/images/{backgrounds,components}/*.{gif,png,jpg,jpeg,svg}',
                './node_modules/uikit/dist/images/**/*.{gif,png,jpg,jpeg,svg}',
                './src/images/**/*.{gif,png,jpg,jpeg,svg}'
            ],
            fonts: [
                './src/fonts/**/*.{ttf,woff,woff2,otf,eot,svg}'
            ]
        },
        dist    : {
            css     : './dist/css',
            fonts   : './dist/fonts',
            js      : './dist/js',
            images  : './dist/images'
        },
        build   : {
            css     : env.demo ? './css' : './build/css',
            fonts   : env.demo ? './fonts' : './build/fonts',
            js      : env.demo ? './js' : './build/js',
            images  : env.demo ? './images' : './build/images'
        }
    };

gulp.task('default', ['build']);

gulp.task('build', ['build:js', 'build:css', 'build:images', 'build:fonts', 'build:html']);

gulp.task(
    'build:js',
    ['clean:js'],
    () => {
        return (
            gulp.src(path.src.js)
                .pipe($.concat('index.js'))
                .pipe($.if(env.production, $.uglify()))
                .pipe(gulp.dest(env.production ? path.build.js : path.dist.js))
        )
    }
);

gulp.task(
    'build:css',
    ['util:variables'],
    () => {
        const
            LessPluginAutoPrefix = require('less-plugin-autoprefix'),
            autoprefix = new LessPluginAutoPrefix({
                browsers: ['> 1%'],
                add: true
            });

        return (
            gulp.src(path.src.css)
                // .pipe($.if(!env.production, $.sourcemaps.init()))
                .pipe($.less({
                    plugins: [ autoprefix ]
                }))
                .pipe($.concat('index.css'))
                .pipe($.if(env.production, $.cssnano({safe: true})))
                // .pipe($.if(!env.production, $.sourcemaps.write('.')))
                .pipe(gulp.dest(env.production ? path.build.css : path.dist.css))
        )
    }
);

gulp.task(
    'build:images',
    () => gulp.src(path.src.images).pipe(gulp.dest(env.production ? path.build.images : path.dist.images))
);

gulp.task(
    'build:fonts',
    () => gulp.src(path.src.fonts).pipe(gulp.dest(env.production ? path.build.fonts : path.dist.fonts))
);

gulp.task(
    'build:html',
    () => gulp.src('./src/**/*.html').pipe(gulp.dest(env.production ? env.demo ? './' : './build/' : './dist/'))
);

//
// Utils && helpers
//
gulp.task(
    'clean:js',
    done => {
        rimraf(env.production ? path.build.js : path.dist.js, {read: false}, done)
    }
);

gulp.task(
    'util:variables',
    done => {
        if (isWatching()) return done();

        const
            globby      = require('globby'),
            Promise     = require('promise'),
            fs          = require('fs'),
            regex       = /(@[\w\-]+\s*:(.*);?)/g,
            variables   = [],
            promises    = [],
            cache       = {};

        globby([
            './src/less/**/*.less',
            '!./src/less/variables.less'
        ]).then(files => {
            files.forEach(file => {
                promises.push(new Promise(resolve => {
                    fs.readFile(file, 'utf-8', (error, data) => {
                        let matches, match, varName, varValue;

                        while (matches = regex.exec(data)) {
                            match       = matches[0].split(':');
                            varName     = match[0].trim();
                            varValue    = match[1];

                            if (env.production && varName == '@icon-font-path') {
                                varValue = '"./../../fonts";';
                            }

                            // add new
                            if (!cache[varName]) {
                                variables.push(varName.concat(':', varValue));
                                cache[varName] = true;
                            }
                            // override core vars
                            else {
                                variables.forEach((item, index) => {
                                    if (varName === item.split(':')[0].trim()) {
                                        variables[index] = varName.concat(':', varValue);
                                    }
                                })
                            }
                        }

                        resolve()
                    })
                }))
            });

            Promise.all(promises).then(() => {
                fs.writeFile(
                    './src/less/variables.less',
                    variables.join('\n'),
                    {
                        flag: 'w+'
                    },
                    error => {
                        if (error) throw error;
                        done()
                    }
                )
            })
        })
    }
);

//
// Watchers
//
gulp.task('watch', ['watch:less', 'watch:js', 'watch:html']);

gulp.task(
    'watch:js',
    ['build:js'],
    () => {
        gulp.watch(['./src/js/**/*.js'], () => {
            runSequence('build:js')
        })
    }
);
gulp.task(
    'watch:less',
    ['build:css'],
    () => {
        gulp.watch(['./src/less/**/*.less', '!./src/less/variables.less'], () => {
            runSequence('util:variables', 'build:css')
        })
    }
);
gulp.task(
    'watch:html',
    ['build:html'],
    ()=>  {
        gulp.watch(['./src/**/*.html'], () => {
            runSequence('build:html')
        })
    }
);
