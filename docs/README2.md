# Interactions

The repo's README file gave an overview of the actors in the system.
This README continues the discusstion by describing the interactions
and relationships.

## The HTTP Server

`bin/www` and `app.js` are the typical main parts of an Express app, and
they serve the same role here. Boring.

## The Socket.io Server

`socket-io-app.js` is the central point of contact for the various actors
in the system. He listens on a socket.io and everyone else contacts him.

### The Viewer (Browser) Contacts

The Viewer part of the system is a typical browser, and it visits the
Express app, which is typically right next to the viewer computer. It
loads and renders the HTML page it was given, which also includes
a socket.io client, which maintains a constant connection between
the client viewer (browser) and the Express server that hosts the
socket.io server.

The Viewer waits to be given data / instructions over the socket. When
he receives a message, he does what it says. Many times a message is
a bundle of Javascript that does one of two things: it either (1)
replaces the old `render()` function with itself and re-draws, or (2) it
replaces / augments the dataset that the viewer is displaying. Basically,
the viewer continually receives new scripts and runs them.

### The Socket.io Server and The Editor

You edit the script and sent it to improve the rendering, or you augment
the data set. Lather, rince, repeat.
