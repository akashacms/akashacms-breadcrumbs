This is a plugin for [AkashaCMS](http://akashacms.com) which generates breadcrumb trails.  These are the trail of links commonly put at the top of the content letting the user navigate to parent pages.

To use it first install the module:

    $ npm install akashacms-breadcrumbs

Then add this to the `config.js` for your site:

    require('akashacms-breadcrumbs').config(module.exports);

It automatically adds itself to the website configuration by

* Adding a directory to the `partials` array.
* Adding a function named `breadcrumbsSync` to those available in templates.

Then in a template you can use it like so:

    <div class="row">
    <section id="breadcrumb" class="col_12">
      <%- breadcrumbsSync({
        partial: "breadcrumbs.html.ejs",
        fileName: fnameRelative
      }) %>
    </section>
    </div>

The module provides a partial named `breadcrumbs.html.ejs`.