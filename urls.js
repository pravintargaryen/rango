import { HttpRequest, HttpResponse, view_fail } from "./index.js"; // Assuming mini_django exports these functions
import * as views from "./views.js"; // Assuming your views are in a separate file (views.js)

export function router(request) {
  console.log("==== Routing to path:", request.path);

  if (request.path === "/") {
    return views.root(request);
  } else if (request.path.startsWith("/dj4e")) {
    return views.dj4e(request);
  } else if (request.path === "/js4e") {
    return views.js4e(request);
  } else if (request.path === "/broken") {
    return views.broken(request);
  }

  // When all else fails, send the 404 screen
  return view_fail(
    request,
    "404",
    "urls.js could not find a view for the path"
  );
}
