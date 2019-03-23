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

module.exports = class BreadcrumbsPlugin extends akasha.Plugin {
    constructor() {
        super("akashacms-breadcrumbs");
    }

    configure(config) {
        this._config = config;
        config.addPartialsDir(path.join(__dirname, 'partials'));
        config.addMahabhuta(module.exports.mahabhuta);
    }
}

var crumb = async function(akasha, config, entry) {
    var found = await akasha.findRendersTo(config, entry.foundPath);
    var renderer = config.findRendererPath(found.foundFullPath);
    if (renderer && renderer.metadata) {
        var metadata = await renderer.metadata(entry.foundDir, found.foundPathWithinDir)
        return {
            title: metadata.title,
            path: '/'+ entry.foundPath
        };
    } else {
        return {
            title: path.basename(entry.foundPath),
            path: '/'+ entry.foundPath
        };
    }
};

module.exports.mahabhuta = new mahabhuta.MahafuncArray("akashacms-breadcrumbs", {});

class BreadcrumbTrailElement extends mahabhuta.CustomElement {
    get elementName() { return "breadcrumb-trail"; }
    async process($element, metadata, dirty) {
        var docpath = metadata.document.path;
        var trail = await metadata.config.akasha.indexChain(metadata.config, docpath);
        // console.log(`breadcrumb-trail ${util.inspect(trail)}`)
        trail = await Promise.all(trail.map(crumbdata => {
            return crumb(metadata.config.akasha, metadata.config, crumbdata);
        }));
        // console.log(`breadcrumb-trail #2 ${util.inspect(trail)}`)
        return await metadata.config.akasha.partial(metadata.config, "breadcrumb-trail.html.ejs", {
            breadcrumbs: trail
        });
    }
}
module.exports.mahabhuta.addMahafunc(new BreadcrumbTrailElement());
