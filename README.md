# StakeTree Site
This is still a work in progress so stay tuned as this evolves.

## Overview
The StakeTree site is built on create-react-app infrastructure with some adjustments. To develop locally, clone this repo and install the local modules:
```
npm install
```
Once that's completed. There's two parts to the site. The production server & the development mode. To start the server run this:
```
npm start
```
This fires up the node server situated in `server.js`. It serves the index.html & also provides a fallback for contract information at `/contract`, that's used by the creator page. To access the site visit: `http://localhost:3000`.

However, the server only serves the bundled JS files. So this is exactly how production will look like. To work locally on the client-side code (React + a few more other libs), you'll need to use the dev mode. This is the traditional create-react-app dev setup with hot reloading & more.
```
npm run dev
```
It'll ask you setup the port on a new location if you have the server running too. So usually you can access the dev site at `http://localhost:3001` or if you're only running the dev mode, it'll also be on `http://localhost:3000`.

TIP: It's not needed to run both the server & dev mode to develop on this.

Now in dev mode, you can edit the React code and it will update automatically in your browser.
Once you have completed your code, you have to bundle your JS code to be rolled up for production. To build it, run this:
```
npm run build
```
And remember to commit these files too. Verify that your code has bundled correctly by running the production code using the command mentioned earlier: `npm start`.

If it all looks good. The code should be all good for review. Send a pull request over and we can go from there.