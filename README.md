# Visualization Tool

## Viewer

On one computer's screen, a browser with D3.js, showing whatever visualization the D3
app was drawing. This is just a big canvas.

## Authoring

On another computer, you are viewing and constantly changing the vizualization.

## Code Organization -- The Server

The app is a typical Express web server, with a Socket.io server added on. It was
generated with the typical express generator. The generator sets things up to make
it easy to add Gulp or Webpack or the like -- the HTTP server only serves things up
from the `/public` directory. There are also `routes` and `views` directories. The
project uses `handlebars`.

There are 4 javascript files in the root directory. They setup the various parts of
the server.

* app.js -- your Express app
* socket-io-app.js -- The Socket.io server
* app-routing.js -- Normal routes.
* app-error-routes.js -- Error routes.

These are all loaded by `bin/www`, which runs under `PM2`.

## Code Organization -- The Client -- Kind of

The client is weird, because Fly is almost a server-only app, at least in the
sense that you do all your work on it.

The app begins the normal way -- a browser talks to the Express app, whch generates
an HTML page, which the client displays as normal. Nothing out of the ordinary so far.

However, the page has socket.io and once the page loads, socket.io calls back to the
server app, ready for changes. Here's where you come in. You work at the server computer,
and leave the client alone, just watching. You edit the Javascript that the page
loaded, and when you save, it gets sent to the browser (via the socket.io), where it
is re-drawn. For all practial purposes, you make live edits to the visualization
and it instantly updates on the viewer.

You also have control over the dataset that is viewed.

### The Assets

As with every Express app, the assets are served from the `/public` directory, which
you generally do not edit.

* A index HTML page (`fly-index.html`)
* The basic stylesheet (`style.css`)
* The first copy of the visualization (`bundle.js`)
