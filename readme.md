## New Local Site Automation
How to use:

1. `npm install` this package.
1. Edit `config.json` to match desired parameters.
    * `themeName` is the name of your theme. Don't use spaces - use `interrogate2016` instead of `Interrogate 2016`, for example.
    * `localRoot` is your local MAMP site directory. See MAMP > Web Server > Document Root.
    * `localhost` is the name of your machine's localhost, along with the  port number: `localhost:81` or `localhost:8888`, for example. See MAMP > Ports > Apache Port.
    * `themeTemplateUrl` is the location of a .zip file containing the WP theme template to use.
    * `dbUser` is the MySQL username of an account with read/write access to your local databases.
    * `dbPassword` is the password for the above account.
    * `dbName` is the name of the database you'll be creating for the new Wordpress install.
    * `dbPort` is the port number of the local MySQL server. See MAMP > Ports > MySQL Port.
    * `debugMode` is a boolean indicating whether or not your WP installation will start in WP_DEBUG mode.
    * `gitInit` is a boolean indicating whether or not the script will automatically run `git init` at the new theme's location.
    * `openInSourcetree` is a boolean indicating whether or not the script will automatically open the new repo in SourceTree (bypassed if `gitInit == false`).
1. Navigate to the containing directory in Terminal, then use `node app` to download, parse, generate, etc. all files in the target location.
1. You'll be directed to the appropriate wp-config page when the downloads and setup complete. Enter the given information there to finish the WP install.
1. Finish the WP install like normal and that's it! You've got a functioning local WP installation at `localhost:[port]/[themeName]`, including the new database and `wp-content/themes/[themeName]` theme downloaded from the Funkhaus style guide.



## Wishlist
1. Set up DeployHQ automatically
1. Create copy of existing site (pull theme from live site, export existing database, etc.)
