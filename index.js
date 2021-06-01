/**
 *
 * Copyright 2013 David Herron
 *
 * This file is part of AkashaCMS-breadcrumbs (http://akashacms.com/).
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

'use strict';

const path     = require('path');
const util     = require('util');
const akasha = require('akasharender');
const mahabhuta = akasha.mahabhuta;

const pluginName = "akashacms-breadcrumbs";

const _plugin_config = Symbol('config');
const _plugin_options = Symbol('options');

module.exports = class BreadcrumbsPlugin extends akasha.Plugin {
    constructor() {
        super(pluginName);
    }

    configure(config, options) {
        this[_plugin_config] = config;
        this[_plugin_options] = options;
        options.config = config;
        config.addPartialsDir(path.join(__dirname, 'partials'));
        config.addMahabhuta(module.exports.mahabhutaArray(options));
    }

    get config() { return this[_plugin_config]; }
    get options() { return this[_plugin_options]; }

}

var crumb = async function(akasha, config, entry) {
    const documents = (await akasha.filecache).documents;
    let found = documents.find(entry.foundPath);
    if (found && found.docMetadata) {
        return {
            title: found.docMetadata.title,
            path: '/'+ entry.foundPath
        };
    } else {
        return {
            title: path.basename(entry.foundPath),
            path: '/'+ entry.foundPath
        };
    }
};

module.exports.mahabhutaArray = function(options) {
    let ret = new mahabhuta.MahafuncArray(pluginName, options);
    ret.addMahafunc(new BreadcrumbTrailElement());
    return ret;
};

class BreadcrumbTrailElement extends mahabhuta.CustomElement {
    get elementName() { return "breadcrumb-trail"; }
    async process($element, metadata, dirty) {
        // console.log(`BreadcrumbTrailElement ${metadata.document.path}`);
        var docpath = metadata.document.path;
        var trail = await akasha.indexChain(this.array.options.config, docpath);
        // console.log(`breadcrumb-trail ${util.inspect(trail)}`)
        trail = await Promise.all(trail.map(crumbdata => {
            return crumb(akasha, this.array.options.config, crumbdata);
        }));
        // console.log(`breadcrumb-trail #2 ${util.inspect(trail)}`)
        let ret = await akasha.partial(this.array.options.config, "breadcrumb-trail.html.ejs", {
            breadcrumbs: trail
        });
        // console.log(`AFTER BreadcrumbTrailElement ${metadata.document.path}`);
        return ret;
    }
}
