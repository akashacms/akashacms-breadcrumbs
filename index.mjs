/**
 *
 * Copyright 2013, 2024 David Herron
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

import path from 'node:path';
import util from 'node:util';
import akasha from 'akasharender';
const mahabhuta = akasha.mahabhuta;

const pluginName = "@akashacms/plugins-breadcrumbs";

const __dirname = import.meta.dirname;

var crumb = async function(akasha, config, entry) {
    const documents = akasha.filecache.documentsCache;
    let found = await documents.find(entry.foundPath);
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

export class BreadcrumbsPlugin extends akasha.Plugin {

    #config;

    constructor() {
        super(pluginName);
    }

    configure(config, options) {
        this.#config = config;
        this.options = options;
        options.config = config;
        config.addPartialsDir(path.join(__dirname, 'partials'));
        config.addLayoutsDir(path.join(__dirname, 'layouts'));
        config.addMahabhuta(mahabhutaArray(options));
    }

    get config() { return this.#config; }

    // This cannot be called from a template which cannot
    // handle async functions
    async doBreadcrumbTrail(metadata) {
        // console.log(`BreadcrumbTrailElement ${util.inspect(metadata)}`);
        const docpath = metadata.document.path;
        let trail = await akasha.indexChain(this.config, docpath);
        // console.log(`breadcrumb-trail ${util.inspect(trail)}`)
        trail = await Promise.all(trail.map(crumbdata => {
            return crumb(akasha, this.config, crumbdata);
        }));
        // console.log(`breadcrumb-trail #2 ${util.inspect(trail)}`)
        let ret = await akasha.partial(this.config, "breadcrumb-trail.html.njk", {
            breadcrumbs: trail
        });
        // console.log(`AFTER BreadcrumbTrailElement ${metadata.document.path}`);
        return ret;
    }

}

export function mahabhutaArray(options) {
    let ret = new mahabhuta.MahafuncArray(pluginName, options);
    ret.addMahafunc(new BreadcrumbTrailElement());
    return ret;
};

class BreadcrumbTrailElement extends mahabhuta.CustomElement {
    get elementName() { return "breadcrumb-trail"; }
    async process($element, metadata, dirty) {
        // // console.log(`BreadcrumbTrailElement ${util.inspect(metadata)}`);
        // const docpath = metadata.document.path;
        // let trail = await akasha.indexChain(this.array.options.config, docpath);
        // // console.log(`breadcrumb-trail ${util.inspect(trail)}`)
        // trail = await Promise.all(trail.map(crumbdata => {
        //     return crumb(akasha, this.array.options.config, crumbdata);
        // }));
        // // console.log(`breadcrumb-trail #2 ${util.inspect(trail)}`)
        // let ret = await akasha.partial(this.array.options.config, "breadcrumb-trail.html.njk", {
        //     breadcrumbs: trail
        // });
        // // console.log(`AFTER BreadcrumbTrailElement ${metadata.document.path}`);
        // return ret;
        return await this.array.options.config.plugin(pluginName)
                    .doBreadcrumbTrail(metadata);
    }
}
