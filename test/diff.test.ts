import { describe, expect, it } from "vitest"
import { changedFiles } from "../src/diff.js"

describe("changedFiles", () => {
  it("reports only newly added or updated session diffs", () => {
    const initial = [{ file: "src/a.ts", before: "one", after: "two", additions: 1, deletions: 1 }]
    const current = [
      { file: "src/a.ts", before: "one", after: "three", additions: 1, deletions: 1 },
      { file: "src/b.ts", before: "", after: "new", additions: 1, deletions: 0 },
    ]
    expect(changedFiles(initial, current).map((diff) => diff.file)).toEqual(["src/a.ts", "src/b.ts"])
  })
})
