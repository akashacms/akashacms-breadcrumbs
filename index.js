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

/**
 * Add ourselves to the config data.
 **/
module.exports.config = function(akasha, config) {
    config.root_partials.push(path.join(__dirname, 'partials'));
    if (config.mahabhuta) {
        config.mahabhuta.push(function(akasha, config, $, metadata, done) {
            $('breadcrumb-trail').each(function(i, elem) {
                $(this).replaceWith(
                    akasha.partialSync(config, "breadcrumb-trail.html.ejs", {
                        breadcrumbs: breadcrumbTrail(akasha, config, metadata.documentPath)
                    })
                );
            });
            done();
        });
    }
    config.funcs.breadcrumbsSync = function(arg, callback) {
        throw new Error("Should not call breadcrumbsSync");
        // util.log('breadcrumbsSync '+ util.inspect(arg));
        if (!arg.documentPath)  { callback(new Error("No 'documentPath' given ")); }
        var val = akasha.partialSync(config, "breadcrumb-trail.html.ejs", {
            breadcrumbs: breadcrumbTrail(akasha, config, arg.documentPath)
        });
        if (callback) callback(undefined, val);
        return val;
    };
};

var crumb = function(akasha, entry) {
    return {
        title: entry.frontmatter.title,
        url: akasha.urlForFile(entry.path)
    };
};

/**
 * Find info useful for constructing a bookmark trail on a page.  This is
 * the Entry for the given file, and any index.html that is a sibling or parent
 * of that file.
 **/
var breadcrumbTrail = function(akasha, config, fileName) {
    var breadCrumbData = [];
    var fnBase = path.basename(fileName);
    var dirname = path.dirname(fileName);
    var entry = akasha.getFileEntry(config.root_docs, fileName);
    if (!entry) {
        throw new Error('NO FILE FOUND for ' + fileName);
    }
    breadCrumbData.push(crumb(akasha, entry));
    
    
    var quitLoop = false;
    
    if (fnBase.indexOf("index.html") === 0) {
        if (dirname === ".") quitLoop = true;
        else dirname = path.dirname(dirname);
    }
    
    while (! quitLoop) {
        // util.log('*** trying "' + dirname +'"');
        var indx = akasha.findIndexFile(config, dirname);
        if (indx) {
            // util.log('got index=' + util.inspect(indx));
            breadCrumbData.unshift(crumb(akasha, indx));
        }
        if (dirname === '.') quitLoop = true;
        else dirname = path.dirname(dirname);
        // util.log('dirname now ' + dirname);
    }
    
    // util.log(util.inspect(breadCrumbData));
    return breadCrumbData;
};

