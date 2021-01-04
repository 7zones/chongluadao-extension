const gulp = require('gulp');
const gap = require('gulp-append-prepend');

const buildDir = process.argv.includes('--firefox') ? 'build-firefox' : 'build';

gulp.task('licenses', function (done) {
  // this is to add ChongLuaDao licenses in the production mode for the minified js
  gulp
    .src([`${buildDir}/js/*js`, `!${buildDir}/js/jquery.js`], {base: './'})
    .pipe(
      gap.prependText(`/*!

=========================================================
* Chong Lua Dao
=========================================================

* Product Page: https://chongluadao.vn/
* Copyright 2021 https://chongluadao.vn/
* Coded by ChongLuaDao

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/`)
    )
    .pipe(gulp.dest('./', {overwrite: true}));

  // this is to add ChongLuaDao licenses in the production mode for the minified html
  gulp
    .src(`${buildDir}/*.html`, {base: './'})
    .pipe(
      gap.prependText(`<!--

=========================================================
* Chong Lua Dao
=========================================================

* Product Page: https://chongluadao.vn/
* Copyright 2021 https://chongluadao.vn/
* Coded by ChongLuaDao

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

-->`)
    )
    .pipe(gulp.dest('./', {overwrite: true}));

  // this is to add ChongLuaDao licenses in the production mode for the minified css
  gulp
    .src(`${buildDir}/*.css`, {base: './'})
    .pipe(
      gap.prependText(`/*!

=========================================================
* Chong Lua Dao
=========================================================

* Product Page: https://chongluadao.vn/
* Copyright 2021 https://chongluadao.vn/
* Coded by ChongLuaDao

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/`)
    )
    .pipe(gulp.dest('./', {overwrite: true}));
  done();
  return;
});
