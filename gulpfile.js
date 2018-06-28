var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
gulp.task("serve", () => {
  seq("build", "ecosystem", "configs", "watch");
});

gulp.task("watch", function() {
  gulp.watch("src/**/*", ["build", "configs", "ecosystem"]);
});

gulp.task("build", function() {
  return tsProject
    .src()
    .pipe(tsProject())
    .js.pipe(gulp.dest("dist"));
});

gulp.task("ecosystem", function() {
  return gulp.src("ecosystem.config.js").pipe(gulp.dest("dist"));
});
gulp.task("configs", function() {
  return gulp.src("src/configs/**/*").pipe(gulp.dest("dist/configs"));
});
gulp.task("default", ["build", "configs", "ecosystem"]);
