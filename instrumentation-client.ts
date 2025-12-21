import { initBotId } from "botid/client/core";

// Define the paths that need bot protection.
// These are paths that are routed to by your app.
initBotId({
  protect: [
    {
      path: "/api/newsletter",
      method: "POST",
    },
    {
      path: "/api/iconic-series-inquiry",
      method: "POST",
    },
    {
      path: "/api/rise-of-a-champion-rsvp",
      method: "POST",
    },
  ],
});
