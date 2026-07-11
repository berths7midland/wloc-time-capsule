import assert from "node:assert/strict";
import test from "node:test";

import app from "./index.js";

function request(path, init) {
  return app.fetch(new Request(`https://wloc.legclub.cyou${path}`, init));
}

test("parse API enforces methods and preflight headers", async () => {
  const options = await request("/api/parse", { method: "OPTIONS" });
  assert.equal(options.status, 204);
  assert.equal(options.headers.get("access-control-allow-methods"), "GET, OPTIONS");

  const post = await request("/api/parse?u=22.544577%2C113.94114", { method: "POST" });
  assert.equal(post.status, 405);
  assert.equal(post.headers.get("allow"), "GET, OPTIONS");
});

test("parse API rejects oversized inputs", async () => {
  const response = await request(`/api/parse?u=${"x".repeat(2049)}`);
  assert.equal(response.status, 413);
});

test("settings fallback never persists or forwards coordinates", async () => {
  const response = await request("/wloc-settings/save?lon=113.9&lat=22.5");
  assert.equal(response.status, 409);
  assert.deepEqual(await response.json(), {
    success: false,
    error: "The local proxy module did not intercept this request.",
  });
});

test("picker uses a nonce, own settings endpoint, and offline map default", async () => {
  const response = await request("/");
  const csp = response.headers.get("content-security-policy");
  const html = await response.text();
  assert.match(csp, /script-src 'self' 'nonce-[a-f0-9]+'/u);
  assert.doesNotMatch(csp, /script-src[^;]*'unsafe-inline'/u);
  assert.doesNotMatch(html, /\sonclick=/u);
  assert.match(html, /<script nonce="[a-f0-9]+">/u);
  assert.match(html, /https:\/\/wloc\.legclub\.cyou\/wloc-settings\/save/u);
  assert.match(html, /let currentLayer = null;/u);
});
