import * as rango from "./index.js"; // Assuming mini_django module is available
import * as urls from "./urls.js"; // Assuming your urls.js file contains the router

// For starting the mini_django web server, similar to Python's `runserver.py`

// Default port is 9000
let port = 9000;

if (process.argv.length > 2) {
  port = parseInt(process.argv[2], 10);
}

console.log("Access http://localhost:" + port);

// Start the server using the mini_django httpServer function
rango.httpServer(urls.router, port);
