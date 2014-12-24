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

var path     = require('path');
var util     = require('util');
var async    = require('async');

/**
 * Add ourselves to the config data.
 **/
module.exports.config = function(akasha, config) {
    config.root_partials.push(path.join(__dirname, 'partials'));
    if (config.mahabhuta) {
        config.mahabhuta.push(function($, metadata, dirty, done) {
        	var docpath = metadata.documentPath;
        	var brdtrails = [];
            $('breadcrumb-trail').each(function(i, elem) { brdtrails.push(elem); });
        	// util.log('breadcrumbs <breadcrumb-trail> count='+ brdtrails.length);
        	if (brdtrails.length <= 0) {
        		// util.log('EMPTY <breadcrumb-trail>');
        		done();
        	} else {
        		// util.log('before breadcrumbTrail '+ docpath);
				breadcrumbTrail(akasha, config, docpath, function(err, trail) {
					// util.log(util.inspect(trail));
					if (err) { 
						// util.log('ERROR <breadcrumb-trail> '+ err); 
						done(err); 
					} else {
						// util.log('breadcrumbTrail cb called on '+ docpath +' trail='+ util.inspect(trail));
						akasha.partial("breadcrumb-trail.html.ejs", {
							breadcrumbs: trail
						}, function(err, replace) {
							async.each(brdtrails,
								function(brd, cb) {
									if (err) cb(err);
									else {
										$(brd).replaceWith(replace);
										cb();
									}
								},
								function(err) {
									if (err) { 
										// util.log('ERROR <breadcrumb-trail> '+ err);
										done(err); 
									} else {
										// util.log('DONE <breadcrumb-trail>'); 
										done(); 
									}
								});
						});
					}
				});
			}
        });
    }
};

var crumb = function(akasha, entry) {
	// util.log('crumb '+ entry.path);
    return {
        title: entry.frontmatter.yaml.title,
        url: akasha.urlForFile(entry.path)
    };
};

/**
 * Find info useful for constructing a bookmark trail on a page.  This is
 * the Entry for the given file, and any index.html that is a sibling or parent
 * of that file.
 **/
var breadcrumbTrail = function(akasha, config, fileName, done) {
	// util.log('breadcrumbTrail '+ fileName);
    var breadCrumbData = [];
    var fnBase = path.basename(fileName);
    var dirname = path.dirname(fileName);
    
    var indexChain = akasha.indexChain(config, fileName);
    for (i = 0; i < indexChain.length; i++) {
    	breadCrumbData.push(crumb(akasha, indexChain[i]));
    }
    done(undefined, breadCrumbData);
};

