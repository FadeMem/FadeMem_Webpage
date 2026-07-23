import { readdir, readFile, unlink } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataFiles = ['metadata/selected_cases.json', 'metadata/tf_ft_cases.json']
const referenced = new Set()

for (const dataFile of dataFiles) {
  const cases = JSON.parse(await readFile(path.join(root, dataFile), 'utf8'))
  for (const item of cases) {
    for (const video of item.videos) {
      referenced.add(video.file)
      referenced.add(video.poster)
    }
  }
}

let removed = 0
for (const assetType of ['web', 'poster']) {
  const directory = path.join(root, 'dist/video', assetType)
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const assetPath = `video/${assetType}/${entry.name}`
    if (entry.isFile() && !referenced.has(assetPath)) {
      await unlink(path.join(directory, entry.name))
      removed += 1
    }
  }
}

console.log(`Deployment assets pruned: ${removed} unused files removed.`)
