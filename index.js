import net from "net";

export class HttpRequest {
  constructor() {
    this.method = "";
    this.path = "";
    this.headers = {};
    this.body = "";
  }
}

export class HttpResponse {
  constructor() {
    this.code = "";
    this.headers = {};
    this._body = [];
  }

  write(line) {
    this._body.push(line);
  }
  get body() {
    return this._body.join("\n"); // Join the body array into a string
  }
  end() {
    if (this.finished) {
      return; // Don't send the response again if already finished
    }

    this.finished = true;
    // Create headers string
    const headersString = Object.keys(this.headers)
      .map((key) => `${key}: ${this.headers[key]}`)
      .join("\n");

    // Here, you would send the headers and body to the client.
    // For a real HTTP server, you would use `response.writeHead` and `response.end`
    console.log("Sending response headers:", this.headers);
    console.log("Sending response body:", this.body);

    // Example: Simulate the response being sent by printing it to the console
    // In a real scenario, you would write to the network socket here:
    // socket.write('HTTP/1.1 200 OK\n' + headersString + '\n\n' + this.body);

    // For debugging purposes:
    console.log("Response sent successfully");
  }
}

export function parseRequest(rd) {
  const retval = new HttpRequest();
  retval.body = rd;
  const ipos = rd.indexOf("\r\n\r\n");
  if (ipos < 1) {
    console.log("Incorrectly formatted request input");
    console.log(JSON.stringify(rd));
    return null;
  }

  //  Find the blank line between HEAD and BODY

  const head = rd.slice(0, ipos - 1);
  const lines = head.split("\n");

  // GET/ HTTP/1.1
  if (lines.length > 0) {
    const firstLine = lines[0];
    const pieces = firstLine.split(" ");
    if (pieces.length >= 2) {
      retval.method = pieces[0] || "Missing";
      retval.path = pieces[1] || "Missing";
    }
  }

  // Accept-Language: en-US,en;q=0.5
  for (let line of lines) {
    line = line.trim();
    const pieces = line.split(": ", 2);
    if (pieces.length !== 2) continue;
    retval.headers[pieces[0].trim()] = pieces[1].trim();
  }

  return retval;
}

export function responseSend(clientsocket, response) {
  try {
    console.log("==== Sending Response Headers");
    let firstline = `HTTP/1.1 ${response.code} OK\r\n`;
    clientsocket.write(firstline);

    for (const [key, value] of Object.entries(response.headers)) {
      console.log(`${key}: ${value}`);
      clientsocket.write(`${key}: ${value}\r\n`);
    }

    clientsocket.write("\r\n");

    let chars = 0;
    for (let line of response._body) {
      line = patchAutograder(line);
      chars += line.length;
      clientsocket.write(line.replace("\n", "\r\n"));
      clientsocket.write("\r\n");
    }

    console.log("==== Sent", chars, "characters body output");
  } catch (err) {
    console.error(err);
    console.error(response);
  }
}

export function patchAutograder(line) {
  if (process.argv.length < 3) return line;
  if (line.indexOf("</body>") === -1) return line;

  let dj4e_autograder;
  if (process.argv[2] === "autograder") {
    dj4e_autograder = "https://www.dj4e.com/tools/jsauto/autograder.js";
  } else {
    dj4e_autograder = process.argv[2];
  }

  return line.replace(
    "</body>",
    `\n<script src="${dj4e_autograder}"></script>\n</body>`
  );
}

export function httpServer(router, port) {
  console.log(`\n================ Starting rango server on ${port}`);
  const serversocket = net.createServer();

  serversocket.on("connection", (clientsocket) => {
    console.log("\n================ Waiting for the Next Request");

    clientsocket.on("data", (data) => {
      let rd = data.toString();
      console.log("====== Received Headers");
      console.log(rd);
      const request = parseRequest(rd);

      let response;

      // If we did not get a valid request, send a 500
      if (!(request instanceof HttpRequest)) {
        response = view_fail(request, "500", "Request could not be parsed");
      } else {
        // Send valid request to the router (urls.js)
        response = router(request);

        // If we did not get a valid response, log it and send back a 500
        if (!(response instanceof HttpResponse)) {
          response = view_fail(
            request,
            "500",
            "Response returned from router / view is not of type HttpResponse"
          );
        }
      }

      try {
        responseSend(clientsocket, response);
        clientsocket.end();
      } catch (err) {
        console.error(err);
        clientsocket.destroy();
      }
    });
  });

  serversocket.listen(port, "localhost", () => {
    console.log(`Server listening on port ${port}`);
  });

  process.on("SIGINT", () => {
    console.log("\nShutting down...\n");
    serversocket.close();
  });
}

export function view_fail(req, code, failure) {
  let res = new HttpResponse();

  console.log("Sending view_fail, code=" + code + " failure=" + failure);

  res.code = code;
  res.headers["Content-Type"] = "text/html; charset=utf-8";

  res.write("<!DOCTYPE html>");
  res.write("<html><body>");
  res.write(
    res.code === "404"
      ? '<div style="background-color: rgb(255, 255, 204);">'
      : '<div style="background-color: pink;">'
  );
  res.write("<b>Page has errors</b>");
  res.write(`<div><b>Request Method:</b> ${req.method}</div>`);
  res.write(`<div><b>Request URL:</b> ${req.path}</div>`);
  res.write(`<div><b>Response Failure:</b> ${failure}</div>`);
  res.write(`<div><b>Response Code:</b> ${res.code}</div>`);
  res.write("</div><pre>");
  res.write("Valid paths: /dj4e /js4e or /404");
  res.write("\nRequest header data:");
  res.write(JSON.stringify(req.headers, null, 4));
  res.write("</pre></body></html>");

  return res;
}
