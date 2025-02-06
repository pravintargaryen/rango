import { HttpRequest, HttpResponse } from "./index.js";

export function root(req) {
  console.log("Request type:", req.constructor.name); // Logs the constructor name of req

  if (!(req instanceof HttpRequest)) {
    throw new Error("Expected an HttpRequest object");
  }
  const res = new HttpResponse();
  res.headers["Content-Type"] = "text/html; charset=utf-8";
  res.write("<!DOCTYPE html>");
  res.write("<html><head></head><body>");
  res.write("<p>mini_django seems to be working!</p>");
  res.write("<p>This is the page at the root path, try another path</p>");
  res.write(
    "<p>Try /dj4e /js4e or generate errors with /missing or /broken</p>"
  );
  res.write("</body></html>");
  console.log(res.body);
  res.end();
  return res;
}

export function dj4e(req) {
  console.log("Request type:", req.constructor.name); // Logs the constructor name of req

  if (!(req instanceof HttpRequest)) {
    throw new Error("Expected an HttpRequest object");
  }

  const res = new HttpResponse();
  res.headers["Content-Type"] = "text/plain; charset=utf-8";
  res.write("Django is fun");
  res.end();
  return res;
}

export function js4e(req) {
  console.log("Request type:", req.constructor.name); // Logs the constructor name of req

  if (!(req instanceof HttpRequest)) {
    throw new Error("Expected an HttpRequest object");
  }
  const res = new HttpResponse();
  res.code = "302"; // Let's do a temporary redirect...
  res.headers["Location"] = "/dj4e";
  res.headers["Content-Type"] = "text/plain; charset=utf-8";
  res.write("You will only see this in the debugger!");
  res.end();
  return res;
}

export function broken(req) {
  console.log("Request type:", req.constructor.name); // Logs the constructor name of req

  if (!(req instanceof HttpRequest)) {
    throw new Error("Expected an HttpRequest object");
  }
  return "I am a broken view, returning a string by mistake";
}
