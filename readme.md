## New Local Site Automation
How to use:

1. `npm install` this package.
1. Edit `config.json` to match desired parameters.
1. `node new-funkhaus` to download, parse, generate, etc. all files in the target location.
1. That's it!

## Todo
2. Unzip the WP install and deletes the .zip afterwards
3. Rename wp-config-sample to wp-config
4. Replace database name, username, and password for localhost development
5. Turn on WP_DEBUG
6. Download the latest Funkhaus style guide commit
7. Install the Funkhaus template folder into the new WordPress install
8. Remove the store (the function in functions.php and the store/ and woocommerce/ folders) if desired
9. Rename and refactors the JS file
10. Clean up extra files along the way

## Wishlist
1. Create new local database and copy over data
2. Create repo and associate it with the new theme