const gulp = require('gulp');
const gap = require('gulp-append-prepend');

gulp.task('licenses', function (done) {
  // this is to add ChongLuaDao licenses in the production mode for the minified js
  gulp
    .src(['!build/js/jquery.js', 'build/js/*js'], {base: './'})
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
    .src('build/*.html', {base: './'})
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
    .src('build/*.css', {base: './'})
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
