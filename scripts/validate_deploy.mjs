import { access, lstat, readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const errors = []
const dataFiles = ['metadata/selected_cases.json', 'metadata/tf_ft_cases.json']
const requiredFiles = [
  'index.html',
  'package.json',
  'package-lock.json',
  'vite.config.js',
  'src/App.jsx',
  'src/main.jsx',
  '.github/workflows/deploy.yml',
]
const forbiddenPaths = [
  'video/original',
  'metadata/raw',
  'metadata/video_manifest.csv',
  'reports',
]
const allowedVideoKeys = new Set(['display_name', 'method_family', 'method_variant', 'file', 'poster'])
const referenced = new Set()

for (const relative of requiredFiles) {
  try {
    await access(path.join(root, relative))
  } catch {
    errors.push(`missing required file: ${relative}`)
  }
}

for (const relative of forbiddenPaths) {
  try {
    await access(path.join(root, relative))
    errors.push(`research-only path must not be published: ${relative}`)
  } catch {
    // Expected: research-only material is absent from this repository.
  }
}

for (const dataFile of dataFiles) {
  const data = JSON.parse(await readFile(path.join(root, dataFile), 'utf8'))
  if (!Array.isArray(data) || data.length === 0) {
    errors.push(`${dataFile} must contain a non-empty array`)
    continue
  }

  for (const item of data) {
    if (!Array.isArray(item.videos) || item.videos.length === 0) {
      errors.push(`${dataFile} has a case without videos: ${item.case_id ?? 'unknown'}`)
      continue
    }

    for (const video of item.videos) {
      const unexpectedKeys = Object.keys(video).filter((key) => !allowedVideoKeys.has(key))
      if (unexpectedKeys.length > 0) {
        errors.push(`${dataFile} contains non-public video fields: ${unexpectedKeys.join(', ')}`)
      }

      for (const key of ['file', 'poster']) {
        const relative = video[key]
        if (typeof relative !== 'string') {
          errors.push(`${dataFile} has an invalid ${key} path`)
          continue
        }
        referenced.add(relative)
        try {
          const info = await stat(path.join(root, relative))
          if (info.size === 0) errors.push(`empty media file: ${relative}`)
          if (info.size >= 100 * 1024 * 1024) errors.push(`media exceeds GitHub's 100 MiB limit: ${relative}`)
        } catch {
          errors.push(`missing referenced media: ${relative}`)
        }
      }
    }
  }
}

for (const assetType of ['web', 'poster']) {
  const directory = path.join(root, 'video', assetType)
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!entry.isFile()) continue
    const relative = `video/${assetType}/${entry.name}`
    if (!referenced.has(relative)) errors.push(`unreferenced media must not be published: ${relative}`)
  }
}

for (const relative of ['public/video/web', 'public/video/poster']) {
  const info = await lstat(path.join(root, relative))
  if (!info.isSymbolicLink()) errors.push(`${relative} must remain a relative symbolic link`)
}

const videoCount = [...referenced].filter((item) => item.endsWith('.mp4')).length
const posterCount = [...referenced].filter((item) => item.endsWith('.jpg')).length
if (videoCount !== 39 || posterCount !== 39) {
  errors.push(`expected 39 videos and 39 posters, found ${videoCount} videos and ${posterCount} posters`)
}

if (errors.length > 0) {
  console.error('Deployment validation failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(`Deployment validation passed: ${videoCount} videos and ${posterCount} posters.`)
