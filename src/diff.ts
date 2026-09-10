import type { FileDiff } from "./client.js"

export function changedFiles(previous: FileDiff[], current: FileDiff[]): FileDiff[] {
  const previousByFile = new Map(previous.map((diff) => [diff.file, fingerprint(diff)]))
  return current.filter((diff) => previousByFile.get(diff.file) !== fingerprint(diff))
}

function fingerprint(diff: FileDiff): string {
  return JSON.stringify([diff.before, diff.after, diff.additions, diff.deletions])
}
