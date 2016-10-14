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
//

const   request     = require('request'),
        fs          = require('fs'),
        unzip       = require('unzip'),
        http        = require('http'),
        rmdir       = require('rmdir'),
        mysql       = require('mysql');

// Load preferences
const   config = JSON.parse( fs.readFileSync('config.json', 'utf-8') );

// Shortcuts to preferences
let     localRoot   = config.localRoot,
        wpPath      = config.localRoot + config.themeName + "/",
        themeFolder = wpPath + "wp-content/themes/" + config.themeName + '/';

const   app = function(){

    console.log('Starting new theme "' + config.themeName + '"!');

    // Download Wordpress
    let latestWordpressUrl = "http://wordpress.org/latest.zip";
    let fileName = "wp.zip";
    let outputPath = localRoot + fileName;

    request(latestWordpressUrl)
        // Save WP to root dir
        .pipe(fs.createWriteStream(outputPath))
        .on('open', () => {
            // Download started
            console.log('Downloading latest version of Wordpress...');
        })
        .on('close', () => {
            // Download complete
            console.log('Wordpress downloaded! Unzipping...');
            // Unzip, then set up wp-config.php
            unzipFile(outputPath, localRoot, /*setupWpConfig*/ cleanupWpDownload);
        });
}

const   cleanupWpDownload = function(){
    console.log('Zip file removed! Renaming theme folder...');

    // Rename folder and config-sample file
    fs.renameSync(localRoot + "wordpress", wpPath);

    downloadFunkhausTemplate();
}

const   setupWpConfig = function(){

    // Rename wp-config
    fs.renameSync(wpPath + "wp-config-sample.php", wpPath + "wp-config.php");

    // Replace database name, username, and password
    // (Assumes 'x_here' placeholders in wp-config.php)
    let configContents = fs.readFileSync(wpPath + 'wp-config.php', 'utf-8');
    let newData = configContents.replace('database_name_here', config.databaseName);
    newData = newData.replace('username_here', 'root');
    newData = newData.replace('password_here', 'root');
    newData = newData.replace("define('WP_DEBUG', false);", "define('WP_DEBUG', true);");

    // Get salts
    http.get({
        host: 'api.wordpress.org',
        path: '/secret-key/1.1/salt/'
    }, function(res){
        var salt = '';

        res.on('data', function(chunk){
            salt += chunk;
        });

        res.on('end', function(){

            // Replace placeholder salts with newly-downloaded version
            newData = newData.replace(/define\('AUTH_KEY(?:.*[\s\S]*)unique phrase here'\);/, salt);
            fs.writeFileSync(wpPath + 'wp-config.php', newData, 'utf8', 'w+');

            // Download Funkhaus template
            console.log('Config updated! Downloading latest Funkhaus template...');
            downloadFunkhausTemplate();

        });
    });

}

const   downloadFunkhausTemplate = function(){
    // Location of Funkhaus template .zip
    let fileUrl = 'https://github.com/funkhaus/style-guide/archive/master.zip';
    // What to call the downloaded zip file
    let fileName = 'funkhaus.zip';
    // Where to save the downloaded file
    let destinationPath = wpPath + 'wp-content/themes/';
    let outputPath = destinationPath + fileName;

    request(fileUrl)
        // Save Funkhaus template to themes directory
        .pipe(fs.createWriteStream(outputPath))
        .on('close', () => {

            // Download complete
            console.log('Funkhaus template downloaded! Unzipping...');
            unzipFile(outputPath, destinationPath, function(){

                console.log('Moving Funkhaus template files...');
                let unzippedPath = destinationPath + 'style-guide-master/template/';
                let newPath = destinationPath + config.themeName;
                fs.renameSync(unzippedPath, newPath);

                console.log('Template files moved! Deleting old template directory...');
                if( fs.existsSync(destinationPath + 'style-guide-master/') ){
                    rmdir(destinationPath + 'style-guide-master/');
                }

                setupDatabase();

            });
        });
}

const   setupDatabase = function(){
/*
    let newDb = new db.DB({
        host: config.localhost,
        user: config.dbUser,
        password: config.dbPassword,
        database: config.databaseName
    });
*/

    let dbConfig = {
        user: config.dbUser,
        port: config.dbPort,
        password: config.dbPassword
    };

    let connection = mysql.createConnection(dbConfig);

    connection.connect((err) => {
        if(err) { console.log('DB error: ' + err); return; }

        connection.query('CREATE DATABASE IF NOT EXISTS ' + config.databaseName, function(err, res){
            console.log('Setting up database...');

            finish();
        });

    });

}

const   finish = function(){
    console.log('Theme setup complete!');
}

app();

/* Utilities */
const   unzipFile = function(filename, destinationPath, onComplete){
    fs.createReadStream(filename)
        .pipe( unzip.Extract({ path: destinationPath }) )
        .on('close', () => {
            console.log(filename + ' unzipped! Removing zip file...');
            fs.unlinkSync(filename);
            onComplete();
        });
}