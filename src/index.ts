/**
 * Cloudflare Worker Entry Point
 * 
 * This is the entry point for Cloudflare Workers.
 * It exports the Hono app which will handle all requests.
 */

import app from "./worker/index";

// Export the fetch handler for Cloudflare Workers
export default {
  fetch: app.fetch,
};

