import gulp from 'gulp';
import gutil from 'gulp-util';
import shell from 'gulp-shell';
import fs from 'fs';
import harp from 'harp';
import browserSync, { reload } from 'browser-sync';
import markdownToJSON from 'gulp-markdown-to-json';
import marked from 'marked';
import staticApi from 'static-api';
import baseData from './src/jsonData/data.json';

gulp.task('serve', () => {
  harp.server(`${__dirname}/src/`, {port: 9000},
    () => {
      browserSync.init({
        proxy: 'localhost:9000'
      });
    }
  );
  watchAllFiles();
});

gulp.task('bs-reload', () => {
  return browserSync.reload()
});

function watchAllFiles() {
  return gulp.watch(
    [
      './src/posts/**/*.md',
      './src/*.md',
      './src/**/*.ejs',
      './src/**/*.jade',
      './src/css/**/*.less',
      './src/css/**/*.sass',
      './src/css/**/*.styl',
      './src/css/**/*.css'
    ],
    ['gen', 'bs-reload']
  );
}

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
    .pipe(gulp.dest('./src'));
}

function generateDataFile(dir) {
  return gulp.src(`./src/${dir}/*.md`)
    .pipe(gutil.buffer())
    .pipe(markdownToJSON(marked, '_data.json'))
    .pipe(gulp.dest(`./src/${dir}`));
}

gulp.task('gen', ['gen-posts-data', 'gen-pages-data'])


//- CLI-style commands to create pages && posts
const templates = [];
const templateFileNames = fs.readdirSync('./src/_templates/');
templateFileNames.map(function (file) {
  return templates[file] = fs.readFileSync(`./src/_templates/${file}`)
});

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

  if (!fs.existsSync(`./src/${dir}`)) {
    const layout = fs.readFileSync('./src/_layout.jade');
    fs.mkdirSync(`./src/${dir}`);
    fs.writeFileSync(`./src/${dir}_layout.jade`, layout);
  }
  fs.writeFileSync(`./src/${dir}${slug}.md`, slugify + templates[`${type}.md`]);
  generateDataFile(dir);
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
      'rm -rf api/',
      'harp compile ./src ./www'
    ]));
});

gulp.task('deploy-api', ['build'], () => {
  const d = Date.now();
  return gulp.src('')
    .pipe(shell([
      'cp -r www/api/ ./api/',
      `echo ${d} >> ./api/date.txt`,
      'git add api/',
      'git commit -m "deploy api commit"',
      'git subtree push --prefix api origin gh-pages'
    ]));
});