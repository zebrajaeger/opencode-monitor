import { describe, expect, it } from "vitest"
import { parseOptions } from "../src/options.js"

describe("parseOptions", () => {
  it("uses the local default", () => {
    expect(parseOptions([]).baseUrl).toBe("http://127.0.0.1:4096")
  })

  it("accepts a URL or host and port", () => {
    expect(parseOptions(["--url", "http://example.test:8080/"]).baseUrl).toBe("http://example.test:8080")
    expect(parseOptions(["--host", "localhost", "--port", "5000"]).baseUrl).toBe("http://localhost:5000")
  })

  it("rejects conflicting addresses", () => {
    expect(() => parseOptions(["--url", "http://localhost:4096", "--port", "5000"])).toThrow("Use --url")
  })

  it("rejects invalid ports", () => {
    expect(() => parseOptions(["--port", "70000"])).toThrow("--port")
  })
})
