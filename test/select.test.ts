import { describe, expect, it } from "vitest"
import { parseSessionChoice, shortId } from "../src/select.js"

describe("session selection", () => {
  it("converts a displayed one-based number into an index", () => {
    expect(parseSessionChoice("2", 3)).toBe(1)
    expect(shortId("abcdefghijk")).toBe("abcdefgh")
  })

  it("rejects invalid selection input", () => {
    expect(() => parseSessionChoice("0", 3)).toThrow("valid conversation")
    expect(() => parseSessionChoice("no", 3)).toThrow("valid conversation")
  })
})
