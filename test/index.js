
const akasha   = require('akasharender');
const plugin = require('../index');
const { assert } = require('chai');

let config;

describe('build site', function() {
    it('should construct configuration', async function() {

        this.timeout(15000);
        config = new akasha.Configuration();
        config.rootURL("https://example.akashacms.com");
        config.configDir = __dirname;
        config.addLayoutsDir('layouts')
              .addDocumentsDir('documents');
        config.use(plugin);
        config.setMahabhutaConfig({
            recognizeSelfClosing: true,
            recognizeCDATA: true,
            decodeEntities: true
        });
        config.prepare();
    });

    it('should run setup', async function() {
        this.timeout(75000);
        try {
            await akasha.cacheSetup(config);
            await Promise.all([
                akasha.setupDocuments(config),
                akasha.setupAssets(config),
                akasha.setupLayouts(config),
                akasha.setupPartials(config)
            ]);
            let filecache = await akasha.filecache;
            await Promise.all([
                filecache.documents.isReady(),
                filecache.assets.isReady(),
                filecache.layouts.isReady(),
                filecache.partials.isReady()
            ]);
        } catch (err) {
            console.error(err.stack);
            throw err;
        }
    });

    it('should copy assets', async function() {
        this.timeout(75000);
        try {
            await config.copyAssets();
        } catch (err) {
            console.error(err.stack);
            throw err;
        }
    });

    it('should build site', async function() {
        this.timeout(15000);
        let failed = false;
        let results = await akasha.render(config);
        for (let result of results) {
            if (result.error) {
                failed = true;
                console.error(result.error);
            }
        }
        assert.isFalse(failed);
    });
});

describe('test pages', function() {
    it('should have correct home page', async function() {

        let { html, $ } = await akasha.readRenderedFile(config, '/index.html');

        assert.exists(html, 'result exists');
        assert.isString(html, 'result isString');

        assert.equal($('#breadcrumbs #breadcrumbTrail a.p-category').length, 1);
        assert.include($('#breadcrumbs #breadcrumbTrail a.p-category').attr('href'), 
                "index.html");

    }); 

    it('should have correct sibling to home page', async function() {

        let { html, $ } = await akasha.readRenderedFile(config, '/page.html');

        assert.exists(html, 'result exists');
        assert.isString(html, 'result isString');

        assert.equal($('#breadcrumbs #breadcrumbTrail a.p-category').length, 1);
        assert.include($('#breadcrumbs #breadcrumbTrail a.p-category').attr('href'),
                "page.html");

    });

    it('should have correct 2nd level no-index page', async function() {

        let { html, $ } = await akasha.readRenderedFile(config, '/no-index/lvl2/page.html');

        assert.exists(html, 'result exists');
        assert.isString(html, 'result isString');

        assert.equal($('#breadcrumbs #breadcrumbTrail a.p-category').length, 2);
        assert.include($('#breadcrumbs #breadcrumbTrail a.p-category:nth-child(1)')
            .attr('href'), "index.html");
        assert.include($('#breadcrumbs #breadcrumbTrail a.p-category:nth-child(2)')
            .attr('href'), "page.html");
    });

    it('should have correct top level no-index page', async function() {

        let { html, $ } = await akasha.readRenderedFile(config, '/no-index/page.html');

        assert.exists(html, 'result exists');
        assert.isString(html, 'result isString');

        assert.equal($('#breadcrumbs #breadcrumbTrail a.p-category').length, 2);
        assert.include($('#breadcrumbs #breadcrumbTrail a.p-category:nth-child(1)')
            .attr('href'), "index.html");
        assert.include($('#breadcrumbs #breadcrumbTrail a.p-category:nth-child(2)')
            .attr('href'), "page.html");
    });

    it('should have correct 2nd level with-index index page', async function() {

        let { html, $ } = await akasha.readRenderedFile(config, '/w-index/lvl2/index.html');

        assert.exists(html, 'result exists');
        assert.isString(html, 'result isString');

        assert.equal($('#breadcrumbs #breadcrumbTrail a.p-category').length, 3);
        assert.include($('#breadcrumbs #breadcrumbTrail a.p-category:nth-child(1)')
            .attr('href'), "index.html");
        assert.include($('#breadcrumbs #breadcrumbTrail a.p-category:nth-child(2)')
            .attr('href'), "../index.html");
        assert.include($('#breadcrumbs #breadcrumbTrail a.p-category:nth-child(3)')
            .attr('href'), "index.html");
    });

    it('should have correct 2nd level with-index sibling page', async function() {

        let { html, $ } = await akasha.readRenderedFile(config, '/w-index/lvl2/page.html');

        assert.exists(html, 'result exists');
        assert.isString(html, 'result isString');

        assert.equal($('#breadcrumbs #breadcrumbTrail a.p-category').length, 4);
        assert.include($('#breadcrumbs #breadcrumbTrail a.p-category:nth-child(1)')
            .attr('href'), "index.html");
        assert.include($('#breadcrumbs #breadcrumbTrail a.p-category:nth-child(2)')
            .attr('href'), "../index.html");
        assert.include($('#breadcrumbs #breadcrumbTrail a.p-category:nth-child(3)')
            .attr('href'), "index.html");
        assert.include($('#breadcrumbs #breadcrumbTrail a.p-category:nth-child(4)')
            .attr('href'), "page.html");
    });

    it('should have correct top level with-index index page', async function() {

        let { html, $ } = await akasha.readRenderedFile(config, '/w-index/index.html');

        assert.exists(html, 'result exists');
        assert.isString(html, 'result isString');

        assert.equal($('#breadcrumbs #breadcrumbTrail a.p-category').length, 2);
        assert.include($('#breadcrumbs #breadcrumbTrail a.p-category:nth-child(1)')
            .attr('href'), "index.html");
        assert.include($('#breadcrumbs #breadcrumbTrail a.p-category:nth-child(2)')
            .attr('href'), "index.html");
    });

    it('should have correct top level with-index sibling page', async function() {

        let { html, $ } = await akasha.readRenderedFile(config, '/w-index/page.html');

        assert.exists(html, 'result exists');
        assert.isString(html, 'result isString');

        assert.equal($('#breadcrumbs #breadcrumbTrail a.p-category').length, 3);
        assert.include($('#breadcrumbs #breadcrumbTrail a.p-category:nth-child(1)')
            .attr('href'), "index.html");
        assert.include($('#breadcrumbs #breadcrumbTrail a.p-category:nth-child(2)')
            .attr('href'), "index.html");
        assert.include($('#breadcrumbs #breadcrumbTrail a.p-category:nth-child(3)')
            .attr('href'), "page.html");
    });


});

describe("Finish up", function() {
    it('should close the configuration', async function() {
        this.timeout(75000);
        await akasha.closeCaches();
    });
});
