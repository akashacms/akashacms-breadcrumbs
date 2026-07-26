
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import akasha from 'akasharender';
import { BasePlugin } from '@akashacms/plugins-base';
import { BreadcrumbsPlugin } from '../index.mjs';

const __dirname = import.meta.dirname;

const config = new akasha.Configuration();
config.rootURL("https://example.akashacms.com");
config.configDir = __dirname;
config.addLayoutsDir('layouts')
      .addDocumentsDir('documents');
config.use(BasePlugin);
config.use(BreadcrumbsPlugin);
config.setMahabhutaConfig({
    recognizeSelfClosing: true,
    recognizeCDATA: true,
    decodeEntities: true
});
config.prepare();

describe('build site', () => {
    it('should successfully setup cache database', async () => {
        try {
            await akasha.setup(config);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }, { timeout: 75000 });

    it('should copy assets', async () => {
        await config.copyAssets();
    }, { timeout: 75000 });

    it('should build site', async () => {
        let failed = false;
        let results = await akasha.render(config);
        for (let result of results) {
            if (result.error) {
                failed = true;
                console.error(result.error);
            }
        }
        assert.equal(failed, false);
    }, { timeout: 25000 });
});

describe('test pages', () => {
    it('should have correct home page', async () => {

        let { html, $ } = await akasha.readRenderedFile(config, '/index.html');

        assert.ok(html, 'result exists');
        assert.equal(typeof html, 'string', 'result isString');

        assert.equal($('#breadcrumbs #breadcrumbTrail[itemtype="https://schema.org/BreadcrumbList"]').length, 1);
        assert.equal($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').length, 1);
        assert.ok($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').attr('href')
                .includes("index.html"));
        assert.equal($('#breadcrumbs #breadcrumbTrail span[itemprop="itemListElement"] meta[itemprop="position"]').eq(0).attr('content'), "1");

    });

    it('should have correct sibling to home page', async () => {

        let { html, $ } = await akasha.readRenderedFile(config, '/page.html');

        assert.ok(html, 'result exists');
        assert.equal(typeof html, 'string', 'result isString');

        assert.equal($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').length, 1);
        assert.ok($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').attr('href')
                .includes("page.html"));
        assert.equal($('#breadcrumbs #breadcrumbTrail span[itemprop="itemListElement"] meta[itemprop="position"]').eq(0).attr('content'), "1");

    });

    it('should have correct 2nd level no-index page', async () => {

        let { html, $ } = await akasha.readRenderedFile(config, '/no-index/lvl2/page.html');

        assert.ok(html, 'result exists');
        assert.equal(typeof html, 'string', 'result isString');

        assert.equal($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').length, 2);
        assert.ok($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').eq(0)
            .attr('href').includes("index.html"));
        assert.ok($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').eq(1)
            .attr('href').includes("page.html"));
        assert.equal($('#breadcrumbs #breadcrumbTrail meta[itemprop="position"]').eq(0).attr('content'), "1");
        assert.equal($('#breadcrumbs #breadcrumbTrail meta[itemprop="position"]').eq(1).attr('content'), "2");
    });

    it('should have correct top level no-index page', async () => {

        let { html, $ } = await akasha.readRenderedFile(config, '/no-index/page.html');

        assert.ok(html, 'result exists');
        assert.equal(typeof html, 'string', 'result isString');

        assert.equal($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').length, 2);
        assert.ok($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').eq(0)
            .attr('href').includes("index.html"));
        assert.ok($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').eq(1)
            .attr('href').includes("page.html"));
        assert.equal($('#breadcrumbs #breadcrumbTrail meta[itemprop="position"]').eq(0).attr('content'), "1");
        assert.equal($('#breadcrumbs #breadcrumbTrail meta[itemprop="position"]').eq(1).attr('content'), "2");
    });

    it('should have correct 2nd level with-index index page', async () => {

        let { html, $ } = await akasha.readRenderedFile(config, '/w-index/lvl2/index.html');

        assert.ok(html, 'result exists');
        assert.equal(typeof html, 'string', 'result isString');

        assert.equal($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').length, 3);
        assert.ok($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').eq(0)
            .attr('href').includes("index.html"));
        assert.ok($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').eq(1)
            .attr('href').includes("../index.html"));
        assert.ok($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').eq(2)
            .attr('href').includes("index.html"));
        assert.equal($('#breadcrumbs #breadcrumbTrail meta[itemprop="position"]').eq(0).attr('content'), "1");
        assert.equal($('#breadcrumbs #breadcrumbTrail meta[itemprop="position"]').eq(1).attr('content'), "2");
        assert.equal($('#breadcrumbs #breadcrumbTrail meta[itemprop="position"]').eq(2).attr('content'), "3");
    });

    it('should have correct 2nd level with-index sibling page', async () => {

        let { html, $ } = await akasha.readRenderedFile(config, '/w-index/lvl2/page.html');

        assert.ok(html, 'result exists');
        assert.equal(typeof html, 'string', 'result isString');

        assert.equal($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').length, 4);
        assert.ok($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').eq(0)
            .attr('href').includes("index.html"));
        assert.ok($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').eq(1)
            .attr('href').includes("../index.html"));
        assert.ok($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').eq(2)
            .attr('href').includes("index.html"));
        assert.ok($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').eq(3)
            .attr('href').includes("page.html"));
        assert.equal($('#breadcrumbs #breadcrumbTrail meta[itemprop="position"]').eq(0).attr('content'), "1");
        assert.equal($('#breadcrumbs #breadcrumbTrail meta[itemprop="position"]').eq(3).attr('content'), "4");
    });

    it('should have correct 2nd level with-index sibling page w/NJK', async () => {

        let { html, $ } = await akasha.readRenderedFile(config, '/w-index/lvl2/page-njk.html');

        assert.ok(html, 'result exists');
        assert.equal(typeof html, 'string', 'result isString');

        assert.equal($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').length, 4);
        assert.ok($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').eq(0)
            .attr('href').includes("index.html"));
        assert.ok($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').eq(1)
            .attr('href').includes("../index.html"));
        assert.ok($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').eq(2)
            .attr('href').includes("index.html"));
        assert.ok($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').eq(3)
            .attr('href').includes("page-njk.html"));
        assert.equal($('#breadcrumbs #breadcrumbTrail meta[itemprop="position"]').eq(0).attr('content'), "1");
        assert.equal($('#breadcrumbs #breadcrumbTrail meta[itemprop="position"]').eq(3).attr('content'), "4");
    });

    it('should have correct top level with-index index page', async () => {

        let { html, $ } = await akasha.readRenderedFile(config, '/w-index/index.html');

        assert.ok(html, 'result exists');
        assert.equal(typeof html, 'string', 'result isString');

        assert.equal($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').length, 2);
        assert.ok($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').eq(0)
            .attr('href').includes("index.html"));
        assert.ok($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').eq(1)
            .attr('href').includes("index.html"));
        assert.equal($('#breadcrumbs #breadcrumbTrail meta[itemprop="position"]').eq(0).attr('content'), "1");
        assert.equal($('#breadcrumbs #breadcrumbTrail meta[itemprop="position"]').eq(1).attr('content'), "2");
    });

    it('should have correct top level with-index sibling page', async () => {

        let { html, $ } = await akasha.readRenderedFile(config, '/w-index/page.html');

        assert.ok(html, 'result exists');
        assert.equal(typeof html, 'string', 'result isString');

        assert.equal($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').length, 3);
        assert.ok($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').eq(0)
            .attr('href').includes("index.html"));
        assert.ok($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').eq(1)
            .attr('href').includes("index.html"));
        assert.ok($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').eq(2)
            .attr('href').includes("page.html"));
        assert.equal($('#breadcrumbs #breadcrumbTrail meta[itemprop="position"]').eq(0).attr('content'), "1");
        assert.equal($('#breadcrumbs #breadcrumbTrail meta[itemprop="position"]').eq(2).attr('content'), "3");
    });

    it('should have correct top level with-index sibling page w/ NJK', async () => {

        let { html, $ } = await akasha.readRenderedFile(config, '/w-index/page-njk.html');

        assert.ok(html, 'result exists');
        assert.equal(typeof html, 'string', 'result isString');

        assert.equal($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').length, 3);
        assert.ok($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').eq(0)
            .attr('href').includes("index.html"));
        assert.ok($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').eq(1)
            .attr('href').includes("index.html"));
        assert.ok($('#breadcrumbs #breadcrumbTrail a[itemprop="item"]').eq(2)
            .attr('href').includes("page-njk.html"));
        assert.equal($('#breadcrumbs #breadcrumbTrail meta[itemprop="position"]').eq(0).attr('content'), "1");
        assert.equal($('#breadcrumbs #breadcrumbTrail meta[itemprop="position"]').eq(2).attr('content'), "3");
    });


});

describe("Finish up", () => {
    it('should close the configuration', async () => {
        await akasha.closeCaches();
    }, { timeout: 75000 });
});
