This is a plugin for [AkashaCMS](http://akashacms.com) which generates breadcrumb trails.  These are the trail of links commonly put at the top of the content letting the user navigate to parent pages.

To use it first install the module:

```shell
$ npm install @akashacms/plugins-breadcrumbs
```

The package `akashacms-breadcrumbs` is old and deprecated, and is replaced by this package.

Then add this to the `config.js` for your site:

```js
import { BreadcrumbsPlugin } from '@akashacms/plugins-breadcrumbs';
// ...
config.
    .use(BreadcrumbsPlugin)
    // ...
```

It automatically adds itself to the website configuration by

* Adding a directory to the `partials` array.
* Adding a Mahafunc handling the tag `<breadcrumb-trail>`

Then in a template you can use it like so:

```html
<div class="row">
<breadcrumb-trail/>
</div>
```

The module provides a partial named `breadcrumbs.html.njk`.
