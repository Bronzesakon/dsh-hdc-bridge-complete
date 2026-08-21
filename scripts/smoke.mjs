// dsh-hdc-bridge regression suite (no real hdc required — fake shell drives
// everything except panel.mjs, whose direct hdc spawn is exercised only for
// its graceful-degradation paths). Run: node scripts/smoke.mjs
const MOD_URL = new URL('../lib/host.js', import.meta.url).href
import { readFile } from 'node:fs/promises'
import { isDevEcoProductInfo, discoverHdcCandidates, parseRegistryPathEntries, parseRegistryPaths, splitPathEntries } from '../lib/studio.mjs'
import { snippetFor } from '../lib/sdk-dts.mjs'
import * as compileOut from '../lib/compile-output.mjs'
import { formatCommandResult, formatDeviceSelectionPrompt } from '../lib/compile-cli.mjs'
import { panelHdcCandidates, parsePanelTargets } from '../lib/panel.mjs'
let failures = 0
function check(name, cond, extra) {
  console.log((cond ? 'PASS' : 'FAIL') + ' [' + name + ']' + (cond || extra === undefined ? '' : ' ' + extra))
  if (!cond) failures += 1
}
// ---------- fake harness ----------
const registered = []
const skills = []
const routes = []
const seen = []
let connected = ['DEV_A', 'DEV_B']
function fakeShell() {
  return {
    resolve: (q) => q,
    run: async (spec) => {
      const cmd = spec.command || ''
      seen.push(cmd)
      let text = ''
      if (cmd.includes('list targets')) text = connected.map((id) => id + '\t\ttcp\tConnected\tlocalhost\thdc').join('\n')
      else if (cmd.includes('hilog')) text = 'I 00000/HiLog: smoke line'
      else if (cmd.includes('PSVersionTable')) text = '7'
      else if (cmd.includes('hdc') && cmd.includes('-v')) text = 'Ver: 3.2.0c'
      else text = ''
      return { stdout: { text }, stderr: { text: '' }, exitCode: 0, timedOut: false }
    },
  }
}
function makeCtx() {
  return {
    get(n) { if (n === 'skills') return { register: (s) => { skills.push(s); return () => {} } }; return undefined },
    inject(names, cb) { if (names.includes('webServer')) cb({ webServer: { register: (r) => routes.push(r) }, effect: (fn) => fn() }) },
    shell: fakeShell(),
    tools: { register: (d) => registered.push(d) },
    effect: (fn) => fn(),
  }
}
const mod = await import(MOD_URL + '?t=' + Date.now())
mod.apply(makeCtx())
const exec = { agent: { session: undefined } }
const lastTarget = () => { const m = [...seen].reverse().find((c) => c.includes('-t')); return m ? (m.match(/-t '([^']+)'/) || [])[1] : '' }

// ---------- 1. registration ----------
check('tools=25', registered.length === 25, 'got ' + registered.length)
check('skills=5', skills.length === 5, 'got ' + skills.length)
check('skills-source-runtime', skills.every((s) => s.source === 'runtime'), JSON.stringify(skills.map((s) => s.name + ':' + s.source)))
check('compile-tools-registered', ['switch_cwd', 'build_project', 'arkts_check', 'start_app', 'hdc_log'].every((name) => registered.some((tool) => tool.name === name)))
check('routes=4', routes.length === 4, routes.map((r) => r.path).join(','))
const registryFixture = 'HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Huawei\\DevEco Studio\\243\r\n    (Default)    REG_SZ    C:\\Users\\tester\\DevEco Studio\r\n    Build    REG_SZ    243.1\r\n'
check('studio-registry-path-parser', parseRegistryPaths(registryFixture)[0] === 'C:\\Users\\tester\\DevEco Studio')
check('studio-path-entry-parser', JSON.stringify(splitPathEntries('C:\\DevEco Studio\\bin;D:\\tools', ';')) === JSON.stringify(['C:\\DevEco Studio\\bin', 'D:\\tools']))
const pathRegistryFixture = 'Path    REG_EXPAND_SZ    C:\\DevEco Studio\\sdk\\default\\openharmony\\toolchains;D:\\tools\\bin\r\n'
check('studio-registry-path-entry-parser', JSON.stringify(parseRegistryPathEntries(pathRegistryFixture)) === JSON.stringify(['C:\\DevEco Studio\\sdk\\default\\openharmony\\toolchains', 'D:\\tools\\bin']))
check('studio-product-identity', isDevEcoProductInfo({ name: 'DevEco Studio', productVendor: 'Huawei' }) && !isDevEcoProductInfo({ name: 'PyCharm', productVendor: 'JetBrains' }))
const discoveredHdc = discoverHdcCandidates().candidates[0]
check('panel-uses-discovered-hdc', !!discoveredHdc && panelHdcCandidates().includes(discoveredHdc.path), JSON.stringify({ discoveredHdc, panelCandidates: panelHdcCandidates().slice(0, 4) }))
const targetFixture = 'HUAWEI_MATEPAD\ttcp\tConnected\t192.168.1.11:12345\nCOM3\tCOM3\nCOM4\tCOM4\tDisconnected\n'
check('panel-filters-serial-targets', JSON.stringify(parsePanelTargets(targetFixture).map((target) => target.id)) === JSON.stringify(['HUAWEI_MATEPAD']))
const snippetFixture = 'export function update(asset: Asset, query: Query): void\nexport function query(asset: Asset): Result\nexport function remove(asset: Asset): void'
const queryWindows = snippetFor(snippetFixture, 'query', 40)
check('sdk-snippet-exact-name', queryWindows.length === 1 && queryWindows[0].text.includes('function query'))
check('build-output-failure-status', compileOut.formatBuildProjectOutput({ stdout: 'Build completed successfully (exitCode=0)', stderr: 'hvigor ERROR: ENOENT', exitCode: 1 }).text.includes('BUILD FAILED (exitCode=1)'))
check('build-output-truncate-export', compileOut.truncateOutput(Array.from({ length: 55 }, (_, i) => 'line-' + i).join('\n')).truncated === true)
check('compile-cli-source-formatting', formatDeviceSelectionPrompt('\u001b[32mName  Kind\nPhone  device\u001b[0m', '').includes('请指定要使用的设备。') && !/\u001b\[/.test(formatCommandResult('devecocli device list', { stdout: '\u001b[32mout\u001b[0m', stderr: '' })))

// ---------- 2. device memory ----------
const hilog = registered.find((t) => t.name === 'hdc_hilog')
const listTool = registered.find((t) => t.name === 'hdc_list_targets')
seen.length = 0; await hilog.execute({ lines: 10 }, exec); const t1 = lastTarget()
seen.length = 0; await hilog.execute({ lines: 10, target: 'DEV_B' }, exec); const t2 = lastTarget()
seen.length = 0; await hilog.execute({ lines: 10 }, exec); const t3 = lastTarget()
connected = ['DEV_A']; seen.length = 0; await hilog.execute({ lines: 10 }, exec); const t4 = lastTarget()
check('memory-flow', t1 === 'DEV_A' && t2 === 'DEV_B' && t3 === 'DEV_B' && t4 === 'DEV_A', JSON.stringify([t1, t2, t3, t4]))
connected = ['DEV_A', 'DEV_B']
const lr = await listTool.execute({}, exec)
check('list-preferred', lr.preferred === 'DEV_A' && lr.preferredActive === true, JSON.stringify({ preferred: lr.preferred, active: lr.preferredActive }))
const startTool = registered.find((tool) => tool.name === 'start_app')
const noDeviceStart = await startTool.execute({}, exec)
check('start-app-no-hvd-does-not-auto-deploy', noDeviceStart.ok === false && !noDeviceStart.hdcFallback && noDeviceStart.availableDevices.some((target) => target.id === 'DEV_A') && /请指定要使用的设备/.test(noDeviceStart.text || '') && !/devecocli background|未检测到可用设备/.test(noDeviceStart.text || ''), JSON.stringify(noDeviceStart))

// A fresh host instance must initialize hdc itself before the first
// list_devices call; this guards the regression where the result depended on
// an earlier hdc_* tool having already discovered the executable.
const freshRegistered = []
mod.apply({
  get() { return undefined },
  inject() {},
  shell: fakeShell(),
  tools: { register: (d) => freshRegistered.push(d) },
  effect: (fn) => fn(),
})
const freshList = freshRegistered.find((tool) => tool.name === 'hdc_log')
const firstList = await freshList.execute({ action: 'list_devices' }, exec)
check('list-devices-first-call', firstList.ok === true && firstList.deviceCount === 2 && firstList.preferred === 'DEV_A' && firstList.preferredActive === true && Array.isArray(firstList.targets), JSON.stringify(firstList))
let renderedList = ''
try { renderedList = freshList.output.render({}, firstList)[0].text } catch (error) { renderedList = String(error && error.message ? error.message : error) }
let renderedJson = null
try { renderedJson = JSON.parse(renderedList) } catch { /* assertion below reports the raw text */ }
check('list-devices-render-json', !!renderedJson && Array.isArray(renderedJson.devices) && Array.isArray(renderedJson.targets) && 'preferredActive' in renderedJson, renderedList)

const hostSrc = await readFile(new URL('../lib/host.js', import.meta.url), 'utf8')
check('hvigor-build-log-isolation', /HVIGOR_USER_HOME/.test(hostSrc) && /build-logs/.test(hostSrc) && /dsh-hvigor-tmp/.test(hostSrc) && /retriedIsolatedHome/.test(hostSrc) && hostSrc.includes("joinPath(base, '.dsh-hvigor-tmp')") && /--stop-daemon/.test(hostSrc) && /--no-daemon/.test(hostSrc) && /JAVA_HOME/.test(hostSrc))
check('hvigor-jbr-daemon-reset', /daemonStopped: true/.test(hostSrc) && /HVIGOR_USER_HOME/.test(hostSrc) && /app_packing_tool\.jar/.test(hostSrc) && /onDeviceTest/.test(hostSrc))
check('hms-build-no-empty-success', hostSrc.includes('function buildResultOk') && hostSrc.includes('buildResultOk(r) && !deMojo') && hostSrc.includes('buildResultOk(r) && !mojo') && hostSrc.includes('artifactVerified'))
check('hms-build-run-ensures-hdc', hostSrc.includes('await ensureHdc(policy)') && hostSrc.includes('install({ hapPath: hap, target: q(args.device) || undefined }, policy)'))
check('hms-build-run-verifies-mission', hostSrc.includes('missionVerified: Boolean(mission.ok)') && hostSrc.includes("appAction({ action: 'start', bundleName, target: q(args.device) || undefined }, policy)"))
check('build-project-clean-rebuilds', hostSrc.includes("const cleanArgv = ['build', 'clean']") && hostSrc.includes("compileCli.commandText(cleanArgv) + ' && ' + compileCli.commandText(argv)") && hostSrc.includes("task: 'assembleHap'"))
check('hms-build-output-strips-ansi', hostSrc.includes('output: compileOut.stripAnsi(fb.output)') && hostSrc.includes('output: compileOut.stripAnsi(deOutput)'))
check('hms-emulator-list-text-fallback', hostSrc.includes("['emulator', 'list', '--format', 'json']") && hostSrc.includes("['emulator', 'list']") && hostSrc.includes('No emulator instances found.'))
check('hms-api-change-text-fallback', hostSrc.includes("['check', 'compat', 'versions', '--format', 'json']") && hostSrc.includes("['check', 'compat', 'versions']") && hostSrc.includes('compat versions returned no output.'))
check('hms-api-change-diff-json-output', hostSrc.includes('changes: json != null ? json : null') && hostSrc.includes('JSON.stringify(json, null, 2)'))
check('hvigor-build-cache-dir-env', /BUILD_CACHE_DIR/.test(hostSrc) && /cache-env/.test(hostSrc) && /hvigorUserHome/.test(hostSrc) && /buildCacheDir/.test(hostSrc))
check('hvigor-pnpm-prewarm', /preWarmPnpm/.test(hostSrc) && /wrapper.*tools/.test(hostSrc) && /pnpm\.cmd/.test(hostSrc))
check('hms-api-change-stderr-merge', /mergeStderr/.test(hostSrc) && /2>&1/.test(hostSrc))
check('hms-emulator-hdc-backfill', /hdcBackfilled/.test(hostSrc) && /isEmulatorTarget/.test(hostSrc))
check('hms-emulator-start-poll', /pollEmulatorRunning/.test(hostSrc) && /verifiedBy/.test(hostSrc))
check('hms-emulator-hdc-ensure', hostSrc.includes('await ensureHdc(policy)') && /hdcBackfilled/.test(hostSrc) && /pollEmulatorRunning/.test(hostSrc))
check('hms-emulator-start-ok-fix', hostSrc.includes('ok: res.ok && poll.running'))
check('hms-emulator-start-idempotent', hostSrc.includes('start is idempotent') && hostSrc.includes('i.status || i.state'))
check('hms-api-change-local-version-guard', hostSrc.includes("const COMPAT_MIN = '26.0.0.810'") && /localVersionGuard/.test(hostSrc) && /compatErrorText/.test(hostSrc))
check('hms-build-hvigor-diagnostics', /hvigorDiag\(/.test(hostSrc) && /daemonStopped:/.test(hostSrc) && /hvigorUserHome:/.test(hostSrc) && /buildCacheDir:/.test(hostSrc))

// ---------- 3. panel routes (env-agnostic paths) ----------
const mkRes = () => ({ statusCode: 0, headers: {}, body: '', writeHead(c, h) { this.statusCode = c; this.headers = h }, end(b) { this.body = b } })
const mkReq = (body) => { const q = { method: 'POST' }; q.on = (ev, cb) => { if (ev === 'data') cb(JSON.stringify(body)); else if (ev === 'end') cb() }; return q }
const ps = routes.find((r) => r.path === '/api2/hdc-bridge/panel-state')
const sel = routes.find((r) => r.path === '/api2/hdc-bridge/select')
const shot = routes.find((r) => r.path === '/api2/hdc-bridge/screenshot.jpeg')
const r1 = mkRes(); await ps.handler({ method: 'GET', on() {} }, r1)
let s1 = null; try { s1 = JSON.parse(r1.body) } catch (e) {}
check('panel-state-json', r1.statusCode === 200 && s1 && typeof s1 === 'object' && 'devices' in s1 && 'preferred' in s1 && 'toolchain' in s1, JSON.stringify(Object.keys(s1 || {})))
const r2 = mkRes(); await sel.handler(mkReq({ target: 'NOT_A_DEVICE' }), r2)
check('select-rejects-unknown', r2.statusCode === 400, 'got ' + r2.statusCode)
const r3 = mkRes(); await shot.handler({ method: 'GET', on() {} }, r3)
check('shot-404-empty', r3.statusCode === 404, 'got ' + r3.statusCode)

// ---------- 4. knowledge layer ----------
const kn = registered.find((t) => t.name === 'hms_knowledge')
const cat = await kn.execute({ action: 'catalog' }, exec)
check('catalog>=28', cat.total >= 28, 'got ' + cat.total)
const rd = await kn.execute({ action: 'read', id: 'sensor', section: 'getSingleSensor' }, exec)
check('sensor-section', rd.ok === true && typeof rd.content === 'string' && rd.content.length > 0)
const sf = await kn.execute({ action: 'search', keywords: '文件' }, exec)
check('search-fileFs', sf.results[0] && sf.results[0].id === 'fileFs', JSON.stringify(sf.results[0] && sf.results[0].id))
const wh = await kn.execute({ action: 'read', id: 'hilog', section: 'info' }, exec)
check('read-hilog', wh.ok === true && /hilog/i.test(wh.content || ''))
const wn = await kn.execute({ action: 'read', id: 'window-Window', section: 'setUIContent' }, exec)
check('read-window-setUIContent', wn.ok === true && /setUIContent/.test(wn.content || ''))
const nv = await kn.execute({ action: 'read', id: 'Navigation', section: '接口' }, exec)
check('read-navigation-api', nv.ok === true && /Navigation/.test(nv.content || ''))
const sw = await kn.execute({ action: 'search', keywords: '日志' }, exec)
check('search-hilog', sw.results.some((x) => x.id === 'hilog'), JSON.stringify(sw.results.slice(0, 3).map((x) => x.id)))

// ---------- 4b. client bundle guards (official client-plugin contract) ----------
// The browser half uses the input-row capsule as its only entry and anchors the
// panel above it. The replay below checks the real loader wiring and confirms
// that no portal or persisted floating-window machinery regresses back in.
const clientSrc = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
check('client-loader-factory', /window\.__ModuleLoader__\.load\(/.test(clientSrc) && /exports\.apply/.test(clientSrc))
check('client-react-module', /require\('react'\)/.test(clientSrc) && !/require\('react-dom'\)/.test(clientSrc))
check('client-slot-registration', /ctx\.slots\.inject\('conversation\.input\.right'/.test(clientSrc) && /ctx\.slots\.register\(/.test(clientSrc))
check('client-official-css-injection', /data-plugin-css/.test(clientSrc) && /--dsw-alias-/.test(clientSrc))
check('client-anchored-not-floating', /hdcp-panel\{position:absolute/.test(clientSrc) && !/createPortal|STORE_KEY|hdcp-resize|onHeadPointerDown/.test(clientSrc))

// ---------- 5. hms_emulator degradation (no devecocli in fake ctx) ----------
const emu = registered.find((t) => t.name === 'hms_emulator')
if (emu) {
  const er = await emu.execute({ action: 'list' }, exec)
  check('emulator-degraded', er.ok === false && /devecocli|install/i.test((er.error || '') + (er.hint || '')), JSON.stringify(er))
} else {
  console.log('SKIP [emulator-tool-registered] 未实现')
}

// ---------- 6. hms_build workspace boundary precheck ----------
const reg2 = []
mod.apply({
  get(n) { if (n === 'sandboxPolicy') return { resolve: () => ({ mode: 'workspace-write', workspaceRoot: 'F:/session-ws' }) }; return undefined },
  inject() {},
  shell: fakeShell(),
  tools: { register: (d) => reg2.push(d) },
  effect: (fn) => fn(),
})
const build2 = reg2.find((t) => t.name === 'hms_build')
const br = await build2.execute({ action: 'build', projectPath: 'F:/other/proj' }, exec)
check('build-boundary', br.ok === false && br.outsideWorkspace === true && /工作区之外/.test(br.error || ''), JSON.stringify({ ok: br.ok, outside: br.outsideWorkspace }))

// ---------- 7. client bundle replay (official slots contract) ----------
// Executes the real browser bundle in Node: apply() runs against a fake slots
// service (capturing the shell.overlay registration), then the registered
// React component is shallow-rendered with a minimal hook runtime — FAB
// present, panel hidden by default, toggle reveals it. This catches the class
// of bug that broke the loader entry in v0.7.0 (undefined.then), end to end.
function makeFakeReact() {
  const hooks = []
  let hIdx = 0
  return {
    __reset() { hIdx = 0 },
    useState(init) {
      const i = hIdx++
      if (!(i in hooks)) hooks[i] = typeof init === 'function' ? init() : init
      return [hooks[i], (v) => { hooks[i] = typeof v === 'function' ? v(hooks[i]) : v }]
    },
    useEffect() { hIdx++ },
    useRef(init) {
      const i = hIdx++
      if (!(i in hooks)) hooks[i] = { current: init }
      return hooks[i]
    },
    createElement(type, props) {
      const children = Array.prototype.slice.call(arguments, 2)
      if (type === '@frag') return { type: '@frag', props: props || {}, children }
      if (typeof type === 'function') {
        return type(Object.assign({}, props || {}, { children: children.length ? children : undefined }))
      }
      return { type, props: props || {}, children }
    },
    Fragment: '@frag',
  }
}
const g0 = globalThis
const savedG = { document: g0.document, localStorage: g0.localStorage, window: g0.window }
let loaderCapture = null
g0.window = {
  __ModuleLoader__: { load: (spec) => { loaderCapture = spec } },
  innerWidth: 1280, innerHeight: 800,
  addEventListener() {}, removeEventListener() {},
}
g0.document = {
  querySelector: () => null,
  createElement: () => ({ setAttribute() {}, textContent: '' }),
  head: { appendChild() {} },
}
g0.localStorage = { m: {}, getItem(k) { return k in this.m ? this.m[k] : null }, setItem(k, v) { this.m[k] = String(v) }, removeItem(k) { delete this.m[k] } }
const clientMod = await import(new URL('../lib/client.js', import.meta.url).href + '?t=' + Date.now())
check('client-loader-captured', !!loaderCapture && loaderCapture.id === 'dsh-hdc-bridge')
const fakeReact = makeFakeReact()
const cmod = loaderCapture && loaderCapture.factory((spec) => { if (spec === 'react') return fakeReact; throw new Error('unexpected require: ' + spec) })
check('client-exports-apply', !!cmod && typeof cmod.apply === 'function' && Array.isArray(cmod.inject) && cmod.inject.includes('slots'), cmod && JSON.stringify(cmod.inject))
const slotCalls = { inject: [], register: [] }
let applyThrew = null
if (cmod) {
  try {
    cmod.apply({
      slots: {
        inject: (name, cb) => { slotCalls.inject.push(name); const d = cb(); slotCalls.register.push(d); return () => {} },
        register: (opts, comp) => ({ name: opts && opts.name, opts, comp, dispose: () => {} }),
      },
    })
  } catch (e) { applyThrew = e }
}
check('client-apply-no-throw', !applyThrew, String(applyThrew && applyThrew.message))
check('client-slots-input-right', slotCalls.inject.length === 1 && slotCalls.inject[0] === 'conversation.input.right', JSON.stringify(slotCalls.inject))
const regEntry = slotCalls.register[0]
check('client-register-shape', !!regEntry && regEntry.name === 'conversation.input.right' && regEntry.opts && regEntry.opts.id === 'hdc-bridge-pill' && typeof regEntry.opts.order === 'number' && typeof regEntry.comp === 'function', JSON.stringify(regEntry && { name: regEntry.name, opts: regEntry.opts }))
function findNode(node, pred, out) {
  out = out || []
  if (!node || typeof node !== 'object') return out
  if (pred(node)) out.push(node)
  const kids = node.children || (node.props && node.props.children)
  if (Array.isArray(kids)) for (const k of kids) findNode(k, pred, out)
  else if (kids && typeof kids === 'object') findNode(kids, pred, out)
  return out
}
if (regEntry && regEntry.comp) {
  fakeReact.__reset()
  const tree1 = regEntry.comp()
  const btn1 = findNode(tree1, (n) => n.type === 'button' && (n.props.className || '').indexOf('hdcp-pill') >= 0)
  const panel1 = findNode(tree1, (n) => n.type === 'div' && (n.props.className || '').indexOf('hdcp-panel') >= 0)
  check('client-pill-closed-by-default', btn1.length === 1 && panel1.length === 0, JSON.stringify({ btns: btn1.length, panels: panel1.length }))
  btn1[0].props.onClick()
  fakeReact.__reset()
  const tree2 = regEntry.comp()
  const panel2 = findNode(tree2, (n) => n.type === 'div' && (n.props.className || '').indexOf('hdcp-panel') >= 0)
  const root2 = findNode(tree2, (n) => n.type === 'span' && (n.props.className || '').indexOf('hdcp-root') >= 0)
  check('client-pill-toggle-shows-anchored-panel', panel2.length === 1 && root2.length === 1, JSON.stringify({ panels: panel2.length, roots: root2.length }))
}
g0.document = savedG.document
g0.localStorage = savedG.localStorage
g0.window = savedG.window

// ---------- summary ----------
console.log('')
console.log(failures === 0 ? 'SMOKE ALL PASS' : 'SMOKE FAILURES: ' + failures)
process.exit(failures === 0 ? 0 : 1)
