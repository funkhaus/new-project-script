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
        fs          = require('fs'),
        unzip       = require('unzip');

// Load preferences
const   config = JSON.parse( fs.readFileSync('config.json', 'utf-8') );

// Shortcuts to preferences
let     localRoot   = config.localRoot,
        wpPath      = config.localRoot + config.themeName + "/",
        themeFolder = wpPath + "wp-content/themes/" + config.themeName;

const   app = function(){
    // Download WP
    let fileUrl = "http://wordpress.org/latest.zip";
    let fileName = "wp.zip";
    let outputPath = localRoot + fileName;
    request(fileUrl)
        // Save WP to root dir
        .pipe(fs.createWriteStream(outputPath))
        .on('open', () => {
            // Download started
            console.log('Downloading latest version of Wordpress...');
        })
        .on('close', () => {
            // Download complete
            console.log('Wordpress downloaded! Unzipping...');
            unzipWp(outputPath);
        });
}

const   unzipWp = function(filename){
    fs.createReadStream(filename)
        .pipe( unzip.Extract({ path: localRoot }) )
        .on('close', () => {
            console.log('Wordpress unzipped! Removing zip file...');
            fs.unlinkSync(filename);
            setupConfig();
        });
}

const   setupConfig = function(){
    console.log('Zip file removed! Renaming theme folder and variables in Wordpress sample config...');

    fs.renameSync(localRoot + "wordpress", wpPath);
    fs.renameSync(wpPath + "wp-config-sample.php", wpPath + "wp-config.php");

}

app();