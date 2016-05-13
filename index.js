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
const async    = require('async');
const akasha = require('../akasharender');

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

var crumb = function(akasha, config, entry) {
	// util.log('crumb '+ entry.path);
	return akasha.findRendersTo(config.documentDirs, entry.foundPath)
	.then(found => {
		// log(`crumb ${util.inspect(entry)} found ${util.inspect(found)}`);
		var renderer = akasha.findRendererPath(found.foundFullPath);
		if (renderer && renderer.metadata) {
			return renderer.metadata(entry.foundDir, found.foundFullPath)
			.then(metadata => {
				// log(`${entry.foundDir} ${entry.foundPath} ${util.inspect(metadata)}`)
				return {
					title: metadata.title,
					path: '/'+ entry.foundPath
				};
			});
		} else {
			return Promise.resolve({
				title: path.basename(entry.foundPath),
				path: '/'+ entry.foundPath
			});
		}
	});
};

/**
 * Find info useful for constructing a bookmark trail on a page.  This is
 * the Entry for the given file, and any index.html that is a sibling or parent
 * of that file.
 **/
var breadcrumbTrail = function(akasha, config, fileName) {
	// util.log('breadcrumbTrail '+ fileName);
	return akasha.indexChain(config, fileName)
	.then(trail => {
		// log(`breadcrumbTrail ${util.inspect(trail)}`);
        return Promise.all(trail.map(crumbdata => {
			return crumb(akasha, config, crumbdata);
		}));
	});
};

module.exports.mahabhuta = [
	function($, metadata, dirty, done) {
		var docpath = metadata.document.path;
		var brdtrails = [];
		$('breadcrumb-trail').each(function(i, elem) { brdtrails.push(elem); });
		// util.log('breadcrumbs <breadcrumb-trail> count='+ brdtrails.length);
		if (brdtrails.length <= 0) {
			// util.log('EMPTY <breadcrumb-trail>');
			done();
		} else {
			// log('before breadcrumbTrail '+ util.inspect(metadata.config) +" "+ docpath);
			breadcrumbTrail(akasha, metadata.config, docpath)
			.then(trail => {
				log('<breadcrumb-trail> '+ util.inspect(trail));
				// util.log('breadcrumbTrail cb called on '+ docpath +' trail='+ util.inspect(trail));
				return akasha.partial(metadata.config, "breadcrumb-trail.html.ejs", {
					breadcrumbs: trail
				})
				.then(replace => {
					return new Promise((resolve, reject) => {
						async.each(brdtrails,
							(brd, cb) => {
								$(brd).replaceWith(replace);
								cb();
							},
							err => {
								if (err) { 
									log('ERROR <breadcrumb-trail> '+ err);
									reject(err); 
								} else {
									// log('DONE <breadcrumb-trail>'); 
									resolve(); 
								}
							});	
					});
				});
			})
			.then(() => { log('DONE #2 <breadcrumb-trail>'); done(); })
			.catch(err => { error(err); done(err) });
		}
	}
];