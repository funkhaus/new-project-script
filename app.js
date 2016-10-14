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
        unzip       = require('unzip'),
        http        = require('http'),
        rmdir       = require('rmdir');

// Load preferences
const   config = JSON.parse( fs.readFileSync('config.json', 'utf-8') );

// Shortcuts to preferences
let     localRoot   = config.localRoot,
        wpPath      = config.localRoot + config.themeName + "/",
        themeFolder = wpPath + "wp-content/themes/" + config.themeName + '/';

const   app = function(){
    console.log('Starting new theme "' + config.themeName + '"!');
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
            unzipWp(outputPath, localRoot, setupConfig);
        });
}

const   unzipWp = function(filename, destinationPath, onComplete){
    fs.createReadStream(filename)
        .pipe( unzip.Extract({ path: destinationPath }) )
        .on('close', () => {
            console.log(filename + ' unzipped! Removing zip file...');
            fs.unlinkSync(filename);
            onComplete();
        });
}

const   setupConfig = function(){
    console.log('Zip file removed! Renaming theme folder and variables in Wordpress sample config...');

    // Rename folder and config-sample file
    fs.renameSync(localRoot + "wordpress", wpPath);
    fs.renameSync(wpPath + "wp-config-sample.php", wpPath + "wp-config.php");
    // Replace database name, username, and password
    let configContents = fs.readFileSync(wpPath + 'wp-config.php', 'utf-8');
    let newData = configContents.replace('database_name_here', config.databaseName);
    newData = newData.replace('username_here', 'root');
    newData = newData.replace('password_here', 'root');
    newData = newData.replace("define('WP_DEBUG', false);", "define('WP_DEBUG', true);");

    http.get({
        host: 'api.wordpress.org',
        path: '/secret-key/1.1/salt/'
    }, function(res){
        var salt = '';

        res.on('data', function(chunk){
            salt += chunk;
        });

        res.on('end', function(){
            newData = newData.replace(/define\('AUTH_KEY(?:.*[\s\S]*)unique phrase here'\);/, salt);
            fs.writeFileSync(wpPath + 'wp-config.php', newData, 'utf8', 'w+');
            console.log('Config updated! Downloading latest Funkhaus template...');
            downloadFunkhausTemplate();
        });
    });

}

const   downloadFunkhausTemplate = function(){
    let fileUrl = 'https://github.com/funkhaus/style-guide/archive/master.zip';
    let fileName = 'funkhaus.zip';
    let destinationPath = wpPath + 'wp-content/themes/';
    let outputPath = destinationPath + fileName;
    request(fileUrl)
        // Save WP to root dir
        .pipe(fs.createWriteStream(outputPath))
        .on('close', () => {
            // Download complete
            console.log('Funkhaus template downloaded! Unzipping...');
            unzipWp(outputPath, destinationPath, function(){

                console.log('Moving Funkhaus template files...');
                let unzippedPath = destinationPath + 'style-guide-master/template/';
                let newPath = destinationPath + config.themeName;
                fs.renameSync(unzippedPath, newPath);

                console.log('Template files moved! Deleting old directory...');
                if( fs.existsSync(destinationPath + 'style-guide-master/') ){
                    rmdir(destinationPath + 'style-guide-master/');
                }


            });
        });
}

app();