// Huawei standalone "Command Line Tools" (命令行工具) discovery.
//
// The CLT is a zip distribution (codelinter, hstack, hvigorw, ohpm, emulator,
// and an EMBEDDED SDK under <root>/sdk) with no installer: users extract it
// anywhere and put <root>/bin on PATH. Mirroring the official deveco-cli
// protocol (tool-provider.ts): DEVECO_CLI_CLT_PATH env first, then the common
// community roots; the only reliable root marker is version.txt carrying
// "# Version: 26.0.0.xxxx". Studio and Command Line Tools stay two sibling
// toolchain kinds — this module never guesses a Studio install.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const env = (typeof process !== 'undefined' && process.env) || {}

export function parseCltVersion(text) {
  const m = /^#\s*Version:\s*(\S+)/m.exec(String(text || ''))
  return m ? m[1] : ''
}

export function cltSdkRoot(root) {
  return join(root, 'sdk')
}

function candidateRoots(extraRoots) {
  const list = []
  const push = (r) => { if (r && !list.includes(String(r))) list.push(String(r)) }
  try { push(env.DEVECO_CLI_CLT_PATH) } catch (e) { /* keep scanning */ }
  for (const r of extraRoots || []) push(r)
  try {
    if (typeof process !== 'undefined' && process.platform === 'win32') {
      push('C:\\command-line-tools')
      push('D:\\command-line-tools')
    }
    push(join(env.USERPROFILE || env.HOME || '', 'command-line-tools'))
    push('/opt/command-line-tools')
  } catch (e) { /* best effort */ }
  return list
}

export function findCltRoot(extraRoots = []) {
  for (const root of candidateRoots(extraRoots)) {
    const marker = join(root, 'version.txt')
    if (!existsSync(marker)) continue
    let text = ''
    try { text = readFileSync(marker, 'utf8') } catch (e) { continue }
    const version = parseCltVersion(text)
    // A missing/unparsable version line still identifies the layout, but the
    // feature gates below need the number — report both facts honestly.
    if (version || existsSync(cltSdkRoot(root))) return { ok: true, root, version }
  }
  return {
    ok: false,
    root: '',
    version: '',
    error: 'Command Line Tools not found. Set DEVECO_CLI_CLT_PATH to the extracted folder (must contain version.txt), or download it from developer.huawei.com/consumer/cn/download/command-line-tools-for-hmos.',
  }
}
