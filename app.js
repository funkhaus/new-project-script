"use strict";

// FUNKHAUS NEW PROJECT INITIALIZER
// ========
//
//  What
//      Set up a new Funkhaus site local install.
//
//  How
//      1. Edit `config.json` to match desired parameters.
//      2. `node new-funkhaus` to download, parse, generate, etc. files.
//      3. That's it!
//
//  Under the Hood
//      What's actually happening when you execute this script?
//      1. Create the desired directory in the desired localhost folder.
//      2. Download the latest version of WordPress.

const   request     = require('request'),
        fs          = require('fs');

// Load preferences
let config = JSON.parse( fs.readFileSync('config.json', 'utf-8') );

// Set root dir for this project
let root = config.localRoot + config.localPath + "/";
// Make root directory
fs.mkdir(root);

// Download WP
let fileUrl = "http://wordpress.org/latest.zip";
let output = root + "wp.zip";
request(fileUrl)
    // Save WP to root dir
    .pipe(fs.createWriteStream(output))
    .on('open', () => {
        // Download started
        console.log('Downloading latest version of Wordpress...');
    })
    .on('close', () => {
        // Download complete
        console.log('Written!');
    });