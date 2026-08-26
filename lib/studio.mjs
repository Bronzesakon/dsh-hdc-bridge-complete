// DevEco Studio local-install discovery: install root + version, the built-in
// codelinter rule docs, and the bundled hvigorw build tool.
// Everything is read from the user's local install at runtime (see notices.json
// entries "codelinter-rules" and "sdk-dts") — nothing is redistributed.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve as pathResolve, dirname } from 'node:path'
import { STUDIO_ROOTS } from './sdk-dts.mjs'

const env = (typeof process !== 'undefined' && process.env) || {}

export function findStudioRoot(extraRoots = []) {
  const roots = []
  // DEVECO_SDK_HOME points at an SDK root; the Studio install is usually its
  // parent directory (…/DevEco Studio/sdk → …/DevEco Studio).
  if (env.DEVECO_SDK_HOME) roots.push(env.DEVECO_SDK_HOME, dirname(pathResolve(env.DEVECO_SDK_HOME)))
  for (const r of extraRoots) if (r) roots.push(pathResolve(r))
  for (const r of STUDIO_ROOTS) roots.push(r)
  for (const root of roots) {
    if (existsSync(join(root, 'product-info.json'))) return { ok: true, root }
  }
  return { ok: false, root: '', error: 'DevEco Studio install not found (checked DEVECO_SDK_HOME-adjacent and default paths).' }
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
// pluginsDir overrides the default <root>/plugins/codelinter base so a
// standalone Command Line Tools layout (<clt>/codelinter/plugins) can be probed.
export function listCodelinterRules(root, pluginsDir = '') {
  const out = []
  const baseDir = pluginsDir || join(root, 'plugins', 'codelinter')
  try {
    if (!existsSync(baseDir)) return { ok: false, error: 'plugins/codelinter not found in the DevEco Studio install', rules: [], docsDir: '' }
    for (const plugin of readdirSync(baseDir)) {
      const docsDir = join(baseDir, plugin, 'docs')
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
  return { ok: true, error: '', rules: out, docsDir: baseDir }
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

export function readRuleDoc(root, id, lang, pluginsDir = '') {
  const safeId = /^[\w-]{1,80}$/.test(id) ? id : ''
  if (!safeId) return { ok: false, error: 'invalid rule id' }
  const langSuffix = lang === 'en' ? '-en' : '-cn'
  const baseDir = pluginsDir || join(root, 'plugins', 'codelinter')
  try {
    for (const plugin of readdirSync(baseDir)) {
      const file = join(baseDir, plugin, 'docs', safeId + langSuffix + '.md')
      if (existsSync(file)) {
        return { ok: true, file, text: readFileSync(file, 'utf8').slice(0, 20000) }
      }
    }
  } catch (e) {
    return { ok: false, error: String(e && e.message ? e.message : e) }
  }
  return { ok: false, error: 'rule doc not found: ' + safeId + langSuffix + '.md' }
}
