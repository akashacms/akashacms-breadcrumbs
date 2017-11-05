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
const co     = require('co');
const akasha = require('akasharender');
const mahabhuta = akasha.mahabhuta;

const log   = require('debug')('akasha:breadcrumbs-plugin');
const error = require('debug')('akasha:error-breadcrumbs-plugin');


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

var crumb = co.wrap(function* (akasha, config, entry) {
	var found = yield akasha.findRendersTo(config.documentDirs, entry.foundPath);
	var renderer = akasha.findRendererPath(found.foundFullPath);
	if (renderer && renderer.metadata) {
		var metadata = yield renderer.metadata(entry.foundDir, found.foundPathWithinDir)
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
});

module.exports.mahabhuta = new mahabhuta.MahafuncArray("akashacms-breadcrumbs", {});

class BreadcrumbTrailElement extends mahabhuta.CustomElement {
	get elementName() { return "breadcrumb-trail"; }
	process($element, metadata, dirty) {
		var docpath = metadata.document.path;
		return co(function* () {
			var trail = yield akasha.indexChain(metadata.config, docpath);
			// console.log(`breadcrumb-trail ${util.inspect(trail)}`)
			trail = yield Promise.all(trail.map(crumbdata => {
				return crumb(akasha, metadata.config, crumbdata);
			}));
			// console.log(`breadcrumb-trail #2 ${util.inspect(trail)}`)
			return yield akasha.partial(metadata.config, "breadcrumb-trail.html.ejs", {
				breadcrumbs: trail
			});
		});
	}
}
module.exports.mahabhuta.addMahafunc(new BreadcrumbTrailElement());
