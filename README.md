# A simple static site and blog with Harp

```
$ npm i -g harp
$ npm i -g gulp
$ git clone git@github.com:alexrdz/harp-blog.git your-site
$ cd your-site
$ npm install
```

### Start the server
```
$ npm run dev
```
You can view your site at `localhost:9000`.

### Create a new page with gulp
```
$ gulp new --page About
```
Creates a new markdown page named `about-me.md` in the root `src` directory. Pages are based off the `page.md` markdown template located in the `templates` directory.

### Create a new post with gulp
```
$ gulp new --post "First Post"
```
Creates a new markdown file name `first-post.md` in the `posts` directory. Posts are based off the `post.md` markdown template located in teh `templates` directory.

### Generate your data
```
$ gulp gen
```
Generates `_data.json` files in `src` and `posts` directories.

### Build static site
```
$ npm run build
```
Generates the static site at `www`.

**Note** the build command adds an empty `CNAME` file. Use this file to add your site's domain for deployment. Eg:
```
your-domain.com
```
That is all the content needed for this file. You may have to configure your DNS. Check with your provider. You can also delete it if you don't need or want it.
