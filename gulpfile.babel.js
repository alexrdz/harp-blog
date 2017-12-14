import gulp from 'gulp';
import gutil from 'gulp-util';
import shell from 'gulp-shell';
import deploy from 'gulp-gh-pages';
import fs from 'fs';
import path from 'path';
import harp from 'harp';
import browserSync, { reload } from 'browser-sync';
import markdownToJSON from 'gulp-markdown-to-json';
import marked from 'marked';
import staticApi from 'static-api';
import baseData from './src/jsonData/data.json';

gulp.task('serve', () => {
  harp.server(`${__dirname}/src/`, {port: 9000},
    () => {
      browserSync.init(['css/*.css', 'js/*.js'], {
        proxy: 'localhost:9000'
      });
    }
  );

  gulp.watch(['./src/posts/**/*.md', './src/*.md', './src/**/*.jade'], ['gen-pages-data', 'gen-posts-data', 'bs-reload']);
});

gulp.task('bs-reload', () => {
  return browserSync.reload()
});


gulp.task('gen-posts-data', generatePosts)

function generatePosts () {
  return gulp.src('./src/posts/**/*.md')
    .pipe(gutil.buffer())
    .pipe(markdownToJSON(marked, '_data.json'))
    .pipe(gulp.dest('./src/posts'))
}

gulp.task('gen-pages-data', generatePages)

function generatePages () {
  return gulp.src('./src/*.md')
    .pipe(gutil.buffer())
    .pipe(markdownToJSON(marked, '_data.json'))
    .pipe(gulp.dest('./src'))
}

gulp.task('gen', ['gen-posts-data', 'gen-pages-data'])



const templates = [];
const templateFileNames = fs.readdirSync('./src/_templates/');
templateFileNames.map(function (file) {
  return templates[file] = fs.readFileSync(`./src/_templates/${file}`)
})

/* Create file */
gulp.task('new', () => {
  const type = process.argv[3].replace(/^-+/, '')
  const path = process.argv[4]
  const file = path.substr(path.lastIndexOf('/') + 1) // find word after last /
  const dir = path.replace(file, '')
  const slug = file.replace(/ /g, '-').toLowerCase()
  const slugify =
    `---
slug: ${slug}
title: ${file}
`
  const layoutContent = `
include ../_partials/head
.container
`

  if (type === 'post') {
    fs.writeFileSync(`./src/posts/${dir}${slug}.md`, slugify + templates[`${type}.md`]);
    generatePosts();
  }

  if (type === 'page') {
    if (!fs.existsSync(`./src/${dir}`)) {
      fs.mkdirSync(`./src/${dir}`)
    }
    fs.writeFileSync(`./src/${dir}${slug}.md`, slugify + templates[`${type}.md`]);
    generatePages();
  }

});



gulp.task('gen-json', generateJson);
function generateJson () {
  return gulp.src(['./src/**/*.md', '!./src/_templates/*.md'])
    .pipe(gutil.buffer())
    .pipe(markdownToJSON(marked, 'data.json'))
    .pipe(gulp.dest('./src/jsonData'));
}

gulp.task('clear-api-dir', () => {
  return gulp.src('')
    .pipe(shell(['rm -rf ./src/api']));
});



gulp.task('gen-api', ['clear-api-dir'], generateApi);
function generateApi() {
  return new staticApi({
    outputFolder: './src/api/',
    object: baseData
  });
}


gulp.task('build', ['gen-json', 'gen-api'], () => {
  return gulp.src('')
    .pipe(shell([
      'harp compile ./src ./www'
    ]));
});

gulp.task('deploy-api', ['build'], () => {
  return gulp.src("./www/api/**/*")
    .pipe(deploy());
});
