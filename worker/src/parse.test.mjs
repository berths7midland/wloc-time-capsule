import assert from "node:assert/strict";
import test from "node:test";

import { extractFromString, parseCoords } from "./parse.js";

test("extracts valid coordinates and rejects invalid ranges", () => {
  assert.deepEqual(extractFromString("https://maps.apple.com/?ll=22.544577,113.94114"), {
    lat: 22.544577,
    lon: 113.94114,
    name: "",
    src: "apple",
  });
  assert.equal(extractFromString("https://maps.apple.com/?ll=122.5,213.9"), null);
});

test("does not fetch arbitrary hosts", async () => {
  const originalFetch = globalThis.fetch;
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    throw new Error("should not run");
  };
  try {
    await assert.rejects(parseCoords("https://example.com/no-coordinates"), /Unsupported map host/);
    assert.equal(called, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("does not follow redirects outside the map allowlist", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(null, {
    status: 302,
    headers: { location: "https://example.com/redirected" },
  });
  try {
    await assert.rejects(parseCoords("https://maps.apple.com/short-link"), /Unsupported map host/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects oversized remote responses", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("x".repeat(128 * 1024 + 1));
  try {
    await assert.rejects(parseCoords("https://maps.apple.com/large-page"), /too large/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
