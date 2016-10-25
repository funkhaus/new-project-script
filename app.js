"use strict";

// FUNKHAUS NEW PROJECT INITIALIZER
// ========
//
//  What
//      Sets up a new Funkhaus site local install.
//
//  How
//      1. Edit `config.json` to match desired parameters.
//      2. `node app` to download, parse, generate, etc. files.
//      3. That's it!
//

const   request     = require('request'),
        fs          = require('fs'),
        unzip       = require('unzip'),
        http        = require('http'),
        rmdir       = require('rmdir'),
        mysql       = require('mysql'),
        open        = require('open');

// Load preferences
const   config = JSON.parse( fs.readFileSync('config.json', 'utf-8') );

// Shortcuts to preferences
let     localRoot   = config.localRoot,
        wpPath      = config.localRoot + config.themeName + "/",
        themeFolder = wpPath + "wp-content/themes/" + config.themeName + '/';

const   app = function(){

    console.log('Starting new theme "' + config.themeName + '"!');

    // Save URL of latest Wordpress release
    let latestWordpressUrl = "http://wordpress.org/latest.zip";
    // Save local path of downloaded release
    let fileName = "wp.zip";
    let outputPath = localRoot + fileName;

    // Download Wordpress
    request(latestWordpressUrl)

        // Save WP to root dir
        .pipe(fs.createWriteStream(outputPath))

        .on('open', () => {
            // Download started
            console.log('Downloading latest version of Wordpress (this may take a minute)...');
        })

        .on('close', () => {

            // Download complete
            console.log('Wordpress downloaded! Unzipping...');

            // Unzip, then rename the new folder
            unzipFile(outputPath, localRoot, cleanupWpDownload);
        });
}

const   cleanupWpDownload = function(){
    console.log('Zip file removed! Renaming theme folder...');

    // If we're set to auto-debug, make it so in wp-config
    if( config.debugMode ){
        let wpConfigContents = fs.readFileSync(localRoot + 'wordpress/wp-config-sample.php', 'utf8');
        let newWpConfigContents = wpConfigContents.replace('define(\'WP_DEBUG\', false);', 'define(\'WP_DEBUG\', true);');
        fs.writeFileSync(localRoot + 'wordpress/wp-config-sample.php', newWpConfigContents);
    }

    // Rename 'wordpress' folder (the newly-unzipped download of WP) and relocate it to the final theme path (localRoot + themeName)
    fs.renameSync(localRoot + "wordpress", wpPath);

    // Download our default theme template
    downloadThemeTemplate();
}

const   downloadThemeTemplate = function(){
    // Location of Funkhaus template .zip
    let fileUrl = config.themeTemplateUrl;
    // What to call the downloaded zip file
    let fileName = 'funkhaus.zip';
    // Where to save the downloaded file
    let destinationPath = wpPath + 'wp-content/themes/';
    let outputPath = destinationPath + fileName;

    request(fileUrl)

        // Save Funkhaus template to themes directory
        .pipe(fs.createWriteStream(outputPath))

        // Download complete
        .on('close', () => {

            console.log('Funkhaus template downloaded! Unzipping...');

            // Unzip the theme template files
            unzipFile(outputPath, destinationPath, () => {

                console.log('Moving Funkhaus template files...');
                // Save current unzipped path
                let unzippedPath = destinationPath + 'style-guide-master/template/';
                // Move unzipped content to wp-content/themes/
                let newPath = destinationPath + config.themeName;
                fs.renameSync(unzippedPath, newPath);

                // Remove old template files
                console.log('Template files moved! Deleting old template directory...');
                if( fs.existsSync(destinationPath + 'style-guide-master/') ){
                    rmdir(destinationPath + 'style-guide-master/');
                }

                // Set up MySQL database
                setupDatabase();

            });
        });
}

const   setupDatabase = function(){

    let dbConfig = {
        user: config.dbUser,
        port: config.dbPort,
        password: config.dbPassword
    };

    // Configure connection
    let connection = mysql.createConnection(dbConfig);

    // connect to MySQL server and create new DB
    connection.connect((err) => {

        // Log error and exit, if present
        if(err) { console.log('DB error: ' + err); return; }

        console.log('Setting up database...');

        // Execute SQL query to create new database
        connection.query('CREATE DATABASE IF NOT EXISTS ' + config.dbName, function(dbErr, res){

            // Handle error
            if( dbErr ){
                console.log('DB error: ' + dbErr);
                return;
            }

            console.log('Database setup complete! Starting WP installation...');

            // Close MySQL server connection
            connection.end();

            // Show the WP install process
            runWpInstall();
        });

    });

}

const   runWpInstall = function(){
    // Open setup-config in the web browser and show what to enter
    open('http://' + config.localhost + '/' + config.themeName + '/wp-admin/setup-config.php?step=1');

    console.log('\n\n========\nTheme setup complete! Fill the form with this information:\n========\n');
    console.log('Database Name: ' + config.dbName);
    console.log('Username: ' + config.dbUser);
    console.log('Password: ' + config.dbPassword);
    console.log('Database Host: ' + config.localhost);
    console.log('Table Prefix: (None set - can leave as "wp_")');
}

/* Utilities */
const   unzipFile = function(filename, destinationPath, onComplete){

    // Unzip a file to a target location
    fs.createReadStream(filename)

        // Save the new location
        .pipe( unzip.Extract({ path: destinationPath }) )

        // When unzipping completes...
        .on('close', () => {
            console.log(filename + ' unzipped! Removing zip file...');

            // Remove the old .zip file
            fs.unlinkSync(filename);

            // Run onComplete callbacl
            onComplete();
        });
}







// Run the app!
app();