// DevEco Studio local-install discovery: install root + version, the built-in
// codelinter rule docs, and the bundled hvigorw build tool.
// Everything is read from the user's local install at runtime (see notices.json
// entries "codelinter-rules" and "sdk-dts") — nothing is redistributed.
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { delimiter as pathDelimiter, dirname, extname, join, resolve as pathResolve } from 'node:path'
import { STUDIO_ROOTS } from './sdk-dts.mjs'

const env = (typeof process !== 'undefined' && process.env) || {}
const isWindows = typeof process !== 'undefined' && process.platform === 'win32'
const REGISTRY_KEYS = [
  'HKLM\\SOFTWARE\\Huawei\\DevEco Studio',
  'HKLM\\SOFTWARE\\WOW6432Node\\Huawei\\DevEco Studio',
  'HKCU\\SOFTWARE\\Huawei\\DevEco Studio',
  'HKCU\\SOFTWARE\\WOW6432Node\\Huawei\\DevEco Studio',
]
let registryPathCache

export function splitPathEntries(value, separator = pathDelimiter) {
  return String(value || '').split(separator).map((entry) => entry.trim()).filter(Boolean)
}

// `reg query ... /s` writes paths as values such as:
//   (Default)    REG_SZ    C:\Users\name\DevEco Studio
// Keep this parser pure for regression tests and use filesystem validation
// before accepting any result as a Studio root.
export function parseRegistryPaths(text) {
  const paths = []
  const seen = new Set()
  for (const line of String(text || '').split(/\r?\n/)) {
    const match = /^\s*(?:\([^)]*\)|\S+)\s+REG_(?:SZ|EXPAND_SZ)\s+(.+?)\s*$/i.exec(line)
    if (!match) continue
    const value = match[1].trim().replace(/^"(.*)"$/, '$1')
    if (!/^(?:[A-Za-z]:[\\/]|\\\\|\/)/.test(value)) continue
    const key = value.toLowerCase()
    if (!seen.has(key)) { seen.add(key); paths.push(value) }
  }
  return paths
}

export function isDevEcoProductInfo(info) {
  if (!info || typeof info !== 'object') return false
  const identity = [info.name, info.productName, info.productVendor, info.envVarBaseName, info.dataDirectoryName].filter(Boolean).join(' ')
  return /deveco/i.test(identity)
}

function registryStudioPaths() {
  if (registryPathCache !== undefined) return registryPathCache
  registryPathCache = []
  if (!isWindows) return registryPathCache
  const seen = new Set()
  for (const key of REGISTRY_KEYS) {
    try {
      const output = execFileSync('reg.exe', ['query', key, '/s'], {
        encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], timeout: 1500, maxBuffer: 262144,
      })
      for (const value of parseRegistryPaths(output)) {
        const normalized = value.toLowerCase()
        if (!seen.has(normalized)) { seen.add(normalized); registryPathCache.push(value) }
      }
    } catch { /* absent keys and restricted registry reads are non-fatal */ }
  }
  return registryPathCache
}

function cleanPath(value) {
  let text = String(value || '').trim().replace(/^"(.*)"$/, '$1')
  text = text.replace(/%([^%]+)%/g, (all, name) => env[name] || all)
  return text
}

function isDevEcoStudioRoot(root) {
  const infoFile = join(root, 'product-info.json')
  if (!existsSync(infoFile)) return false
  try {
    const info = JSON.parse(readFileSync(infoFile, 'utf8'))
    if (isDevEcoProductInfo(info)) return true
  } catch { return false }
  // Older builds may lack complete product metadata, but retain the DevEco
  // launcher plus SDK signature rather than accepting any JetBrains product.
  return existsSync(join(root, 'bin', 'devecostudio64.exe')) && existsSync(join(root, 'sdk'))
}

function addStudioRoot(records, value, source) {
  let current = cleanPath(value)
  if (!current) return
  try { current = pathResolve(current) } catch { return }
  if (extname(current)) current = dirname(current)
  for (let depth = 0; depth < 7; depth += 1) {
    if (isDevEcoStudioRoot(current)) {
      const key = current.toLowerCase()
      const existing = records.get(key)
      if (existing) {
        if (!existing.sources.includes(source)) existing.sources.push(source)
      } else {
        records.set(key, { root: current, sources: [source] })
      }
      return
    }
    const parent = dirname(current)
    if (parent === current) return
    current = parent
  }
}

// Discover only validated Studio roots. Explicit paths win, followed by
// environment variables, registry records, PATH entries, and legacy defaults.
export function discoverStudioRoots(extraRoots = []) {
  const records = new Map()
  for (const root of extraRoots) addStudioRoot(records, root, 'explicit')
  for (const name of ['DEVECO_STUDIO_HOME', 'DEVECO_HOME', 'DEVECO_SDK_HOME']) {
    if (env[name]) addStudioRoot(records, env[name], 'env:' + name)
  }
  const registryPaths = registryStudioPaths()
  for (const root of registryPaths) addStudioRoot(records, root, 'registry')
  for (const entry of splitPathEntries(env.PATH || env.Path)) addStudioRoot(records, entry, 'PATH')
  for (const root of STUDIO_ROOTS) addStudioRoot(records, root, 'default')
  return { roots: [...records.values()], registryPaths }
}

export function findStudioRoot(extraRoots = []) {
  const discovery = discoverStudioRoots(extraRoots)
  const found = discovery.roots[0]
  if (found) return { ok: true, root: found.root, sources: found.sources, registryPaths: discovery.registryPaths }
  return {
    ok: false,
    root: '',
    sources: [],
    registryPaths: discovery.registryPaths,
    error: 'DevEco Studio install not found (checked explicit paths, DevEco environment variables, Windows registry, PATH, and default paths).',
  }
}

export function studioVersion(root) {
  try {
    const info = JSON.parse(readFileSync(join(root, 'product-info.json'), 'utf8'))
    return (info && info.version) || null
  } catch {
    return null
  }
}

export function hvigorwPath(root) {
  const win = join(root, 'tools', 'hvigor', 'bin', 'hvigorw.bat')
  if (existsSync(win)) return { ok: true, path: win, kind: 'batch' }
  const posix = join(root, 'tools', 'hvigor', 'bin', 'hvigorw')
  if (existsSync(posix)) return { ok: true, path: posix, kind: 'sh' }
  return { ok: false, path: '', kind: '' }
}

// Rule docs live as docs/<rule-id>-{cn,en}.md under each codelinter plugin.
export function listCodelinterRules(root) {
  const out = []
  try {
    const pluginDir = join(root, 'plugins', 'codelinter')
    if (!existsSync(pluginDir)) return { ok: false, error: 'plugins/codelinter not found in the DevEco Studio install', rules: [], docsDir: '' }
    for (const plugin of readdirSync(pluginDir)) {
      const docsDir = join(pluginDir, plugin, 'docs')
      if (!existsSync(docsDir)) continue
      for (const f of readdirSync(docsDir)) {
        const m = /^(.+)-cn\.md$/.exec(f)
        if (!m) continue
        const id = m[1]
        const en = id + '-en.md'
        const title = ruleTitle(join(docsDir, f)) || id
        out.push({ id, title, plugin, cn: f, en: existsSync(join(docsDir, en)) ? en : '' })
      }
    }
  } catch (e) {
    return { ok: false, error: String(e && e.message ? e.message : e), rules: [], docsDir: '' }
  }
  return { ok: true, error: '', rules: out, docsDir: join(root, 'plugins', 'codelinter') }
}

function ruleTitle(file) {
  try {
    const text = readFileSync(file, 'utf8')
    const m = /^#\s+(.+)$/m.exec(text)
    return m ? m[1].trim().slice(0, 120) : ''
  } catch {
    return ''
  }
}

export function readRuleDoc(root, id, lang) {
  const safeId = /^[\w-]{1,80}$/.test(id) ? id : ''
  if (!safeId) return { ok: false, error: 'invalid rule id' }
  const langSuffix = lang === 'en' ? '-en' : '-cn'
  try {
    const pluginDir = join(root, 'plugins', 'codelinter')
    for (const plugin of readdirSync(pluginDir)) {
      const file = join(pluginDir, plugin, 'docs', safeId + langSuffix + '.md')
      if (existsSync(file)) {
        return { ok: true, file, text: readFileSync(file, 'utf8').slice(0, 20000) }
      }
    }
  } catch (e) {
    return { ok: false, error: String(e && e.message ? e.message : e) }
  }
  return { ok: false, error: 'rule doc not found: ' + safeId + langSuffix + '.md' }
}
