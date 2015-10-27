/***************
 * Install
 ***************/

0. Checkout the source from Repository
   > svn co https://~

1. Install the node modules, which depends on the file package.json.
   > npm install

2. Copy the settings from /common folder to project root.
   > cp common/system.json .

3. Run the application with Forever (suggest to install globally)
   > forever start app.js
