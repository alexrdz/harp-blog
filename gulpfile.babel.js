import gulp from 'gulp';
import gutil from 'gulp-util';
import markdownToJSON from 'gulp-markdown-to-json';
import marked from 'marked';
import fs from 'fs';

gulp.task('gen-posts-data', () => {
  gulp.src('./src/posts/**/*.md')
  .pipe(gutil.buffer())
  .pipe(markdownToJSON(marked, '_data.json'))
  .pipe(gulp.dest('./src/posts'))
});

gulp.task('gen-pages-data', () => {
  gulp.src('./src/*.md')
    .pipe(gutil.buffer())
    .pipe(markdownToJSON(marked, '_data.json'))
    .pipe(gulp.dest('./src'))
});

gulp.task('gen', ['gen-posts-data', 'gen-pages-data']);



let templateFileNames;
let templates = [];
templateFileNames = fs.readdirSync('./src/_templates/');
templateFileNames.map(function (file) {
  return templates[file] = fs.readFileSync(`./src/_templates/${file}`);
});

/* Create file */
gulp.task('new', () => {
  let template = process.argv[3].replace(/^-+/, "");
  let path = process.argv[4];
  let file = path.substr(path.lastIndexOf('/') + 1); // find word after last /
  let dir = path.replace(file, '');
  const slug = file.replace(/ /g, '-').toLowerCase();
  const slugify =
`---
slug: ${slug}
title: ${file}
`;

  if (template === 'post') {
    fs.writeFileSync(`./src/posts/${dir}${slug}.md`, slugify + templates[`${template}.md`]);
  }

  if (template === 'page') {
    fs.writeFileSync(`./src/${dir}${file}.md`, slugify + templates[`${template}.md`]);
  }
});