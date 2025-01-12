import http from "http";

const requestHandler = http.createServer(
  { keepAliveTimeout: 60000 },
  (req, res) => {
    console.log("Request made");
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write("<!DOCTYPE html>\n");
    res.write("<html>\n");
    res.write("<body>\n");
    res.write("<h1>Rango</h1>\n");
    res.write("</body>\n");
    res.write("</html>\n");
    res.end();
  }
);

requestHandler.listen(8000, () => console.log("listening"));
