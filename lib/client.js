// dsh-hdc-bridge browser bundle: capsule status pill inside the input row
// (conversation.input.right, left of the dsh-opencode-usage widget), tap to
// expand the dev panel UPWARD. No floating window, no drag/resize, no
// screenshot button. Follows the harness visual tokens (--dsw-alias-*).
// Hand-written in the client module format (window.__ModuleLoader__).
window.__ModuleLoader__.load({
  id: 'dsh-hdc-bridge',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    var react = require('react');
    var NL = String.fromCharCode(10);
    var CSS = [
      '.hdp-root{display:inline-flex;position:relative}',
      '.hdp-pill{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2,#3a3d46);background:transparent;color:var(--dsw-alias-label-secondary,#9ba0ab);cursor:pointer;font-size:12px;line-height:18px;font-variant-numeric:tabular-nums}',
      '.hdp-pill:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.06))}',
      '.hdp-dot{width:7px;height:7px;border-radius:50%;background:#8a8f99;flex:none}',
      '.hdp-dot-ok{background:var(--dsw-alias-state-success-primary,#34c759)}',
      '.hdp-dot-err{background:var(--dsw-alias-state-error-primary,#ff5252)}',
      '.hdp-dot-warn{background:var(--dsw-alias-state-warn-primary,#ffb020)}',
      '.hdp-pill-label{white-space:nowrap}',
      '.hdp-tip{position:absolute;bottom:calc(100% + 8px);left:50%;translate:-50% 0;white-space:nowrap;max-width:260px;overflow:hidden;text-overflow:ellipsis;border:1px solid var(--dsw-alias-border-inverted,#3a3d46);background:var(--dsw-specific-menu,#23252c);box-shadow:var(--dsw-shadow-lv2,0 6px 16px rgba(0,0,0,.3));color:var(--dsw-alias-label-primary,#e9e9ef);border-radius:8px;padding:4px 9px;font-size:12px;line-height:18px;opacity:0;visibility:hidden;transition:opacity .12s ease,visibility .12s ease;z-index:110;pointer-events:none}',
      '.hdp-tip[data-show=true]{opacity:1;visibility:visible}',
      '.hdp-pop{position:absolute;bottom:calc(100% + 8px);right:0;width:300px;max-height:min(480px,calc(100vh - 120px));display:flex;flex-direction:column;box-sizing:border-box;border:1px solid var(--dsw-alias-border-inverted,#3a3d46);background:var(--dsw-specific-menu,#23252c);box-shadow:var(--dsw-shadow-lv3,0 10px 28px rgba(0,0,0,.4));border-radius:12px;color:var(--dsw-alias-label-secondary,#9ba0ab);cursor:default;z-index:100;overflow:hidden;font-size:12px;line-height:20px}',
      '.hdp-pop-head{display:flex;align-items:center;gap:8px;padding:10px 12px 0}',
      '.hdp-pop-title{flex:1 1 auto;font-weight:600;color:var(--dsw-alias-label-primary,#e9e9ef)}',
      '.hdp-btn{background:transparent;border:1px solid var(--dsw-alias-border-l2,#3a3d46);border-radius:6px;color:inherit;padding:2px 8px;font:inherit;font-size:12px;cursor:pointer}',
      '.hdp-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.06))}',
      '.hdp-btn:disabled{opacity:.5;cursor:default}',
      '.hdp-tools{display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:8px 12px;border-top:1px solid var(--dsw-alias-border-l2,#3a3d46);margin-top:8px}',
      '.hdp-tools-label{color:var(--dsw-alias-label-tertiary,#8a8f99);font-size:11px;margin-right:2px}',
      '.hdp-badge{background:rgba(90,150,255,.16);color:#7aa7ff;border-radius:4px;padding:0 6px;font-size:11px;line-height:16px}',
      '.hdp-badge-pref{background:rgba(52,199,89,.20);color:#5dd37c}',
      '.hdp-pop-body{padding:8px 12px 10px;flex:1 1 auto;min-height:0;overflow:auto}',
      '.hdp-hint{color:var(--dsw-alias-label-tertiary,#8a8f99);margin:2px 0 6px}',
      '.hdp-dev{padding:5px 6px;border-bottom:1px dashed var(--dsw-alias-border-l2,#2c2e37);cursor:pointer;border-radius:4px}',
      '.hdp-dev:hover{background:rgba(255,255,255,.05)}',
      '.hdp-dev-pref{background:rgba(90,150,255,.10)}',
      '.hdp-dev-main{min-width:0}',
      '.hdp-dev-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-primary,#e9e9ef)}',
      '.hdp-dev-id{font-family:ui-monospace,Consolas,monospace;color:var(--dsw-alias-label-tertiary,#8a8f99);font-size:11px}',
      '.hdp-dev-sub{display:flex;flex-wrap:wrap;gap:4px;margin-top:2px}',
      '.hdp-sys{display:grid;grid-template-columns:1fr 1fr;gap:4px 10px;margin:8px 0;padding:6px 8px;background:rgba(255,255,255,.03);border-radius:6px;color:var(--dsw-alias-label-tertiary,#8a8f99);font-size:11px}',
      '.hdp-pre{flex:0 0 auto;max-height:140px;overflow:auto;background:#16171c;padding:6px;border-radius:6px;font:10px/1.4 ui-monospace,Consolas,monospace;margin:8px 0 0;white-space:pre-wrap;word-break:break-all}',
      '.hdp-foot{color:var(--dsw-alias-label-tertiary,#8a8f99);padding:0 12px 10px;font-size:11px}',
      '.hdp-err{color:var(--dsw-alias-state-danger-primary,#ff6b6b);margin-top:4px;font-size:11px}',
    ].join('');

    function injectStyles() {
      if (document.getElementById('hdc-pill-style')) return;
      var tag = document.createElement('style');
      tag.id = 'hdc-pill-style';
      tag.textContent = CSS;
      document.head.appendChild(tag);
    }

    function fmtTime(ms) {
      var d = new Date(ms);
      return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2);
    }

    var bases = ['/api2/hdc-bridge', '/api2/hdc-panel-live'];
    var baseIdx = 0;
    var baseLocked = false;
    function currentBase() { return bases[baseIdx]; }
    function advanceBase() {
      if (baseLocked) return;
      if (baseIdx + 1 < bases.length) baseIdx += 1;
    }
    var POLL_MS = 8000;

    function HarmonyPill() {
      var stateRef = react.useRef(null);
      var errRef = react.useRef('');
      var [state, setState] = react.useState(null);
      var [err, setErr] = react.useState('');
      var [open, setOpen] = react.useState(false);
      var [tip, setTip] = react.useState(false);
      var [busy, setBusy] = react.useState(false);
      var rootRef = react.useRef(null);

      react.useEffect(function () {
        var alive = true;
        function poll() {
          fetch(currentBase() + '/panel-state')
            .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
            .then(function (s) { if (!alive) return; baseLocked = true; stateRef.current = s; errRef.current = ''; setState(s); setErr(''); })
            .catch(function (e) { if (!alive) return; advanceBase(); errRef.current = String(e && e.message ? e.message : e); setErr(errRef.current); });
        }
        poll();
        var timer = setInterval(poll, POLL_MS);
        return function () { alive = false; clearInterval(timer); };
      }, []);

      react.useEffect(function () {
        if (!open) return;
        function onDown(e) {
          if (e.target instanceof Node && rootRef.current && rootRef.current.contains(e.target)) return;
          setOpen(false);
        }
        function onKey(e) { if (e.key === 'Escape') setOpen(false); }
        document.addEventListener('pointerdown', onDown);
        document.addEventListener('keydown', onKey);
        return function () {
          document.removeEventListener('pointerdown', onDown);
          document.removeEventListener('keydown', onKey);
        };
      }, [open]);

      function refresh() {
        setBusy(true);
        fetch(currentBase() + '/refresh', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shot: false, target: '' }) })
          .then(function (r) { return r.json(); })
          .then(function (s) { baseLocked = true; stateRef.current = s; errRef.current = ''; setState(s); setErr(''); })
          .catch(function (e) { errRef.current = String(e && e.message ? e.message : e); setErr(errRef.current); })
          .finally(function () { setBusy(false); });
      }

      function select(id) {
        fetch(currentBase() + '/select', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target: id }) })
          .then(function (r) { return r.json(); })
          .then(function (s) { baseLocked = true; stateRef.current = s; errRef.current = ''; setState(s); setErr(''); })
          .catch(function () { refresh(); });
      }

      var s = state;
      var hasDev = !!(s && s.devices && s.devices.length);
      var hasErr = !!err || !!(s && (s.error || s.lastError));
      var dotClass = 'hdp-dot' + (hasErr ? ' hdp-dot-warn' : (hasDev ? ' hdp-dot-ok' : ' hdp-dot-err'));
      var label;
      if (err) label = '面板通道不可用';
      else if (s && s.ok === false && s.error) label = 'hdc 异常';
      else if (s && hasDev) label = '鸿蒙 · ' + s.devices.length + ' 设备';
      else if (s && !hasDev && !s.hdc) label = 'hdc 缺失';
      else label = '鸿蒙 · 无设备';

      var tc = (s && s.toolchain) || {};
      var tipText = [
        tc.studio ? 'Studio ' + tc.studio : '',
        tc.sdk ? 'SDK API ' + tc.sdk : '',
        'devecocli ' + (tc.devecocli ? '有' : '无'),
        tc.knowledge ? '知识 ' + tc.knowledge + ' 篇' : '',
      ].filter(Boolean).join(' · ') || '本地工具链';

      var toolBadges = [];
      if (tc.studio) toolBadges.push(react.createElement('span', { className: 'hdp-badge', key: 'st' }, 'Studio ' + tc.studio));
      if (tc.sdk) toolBadges.push(react.createElement('span', { className: 'hdp-badge', key: 'sdk' }, 'SDK API ' + tc.sdk));
      toolBadges.push(react.createElement('span', { className: 'hdp-badge', key: 'cli' }, 'devecocli ' + (tc.devecocli ? '有' : '无')));
      if (tc.knowledge) toolBadges.push(react.createElement('span', { className: 'hdp-badge', key: 'kn' }, '离线知识 ' + tc.knowledge + ' 篇'));

      var pref = (s && s.preferred) || (s && s.devices && s.devices[0] && s.devices[0].id) || '';
      var devices = [];
      ((s && s.devices) || []).forEach(function (d) {
        var isPref = s.preferred === d.id;
        var subBadges = [];
        if (d.model) subBadges.push(react.createElement('span', { className: 'hdp-badge', key: 'm' }, d.model));
        if (d.apiVersion) subBadges.push(react.createElement('span', { className: 'hdp-badge', key: 'a' }, 'API ' + d.apiVersion));
        if (d.battery) {
          subBadges.push(react.createElement('span', { className: 'hdp-badge', key: 'b' }, '电池 ' + d.battery.capacity + '%'));
          if (d.battery.charging) subBadges.push(react.createElement('span', { className: 'hdp-badge', key: 'c' }, '充电中'));
          if (d.battery.temperature !== null && d.battery.temperature !== undefined) subBadges.push(react.createElement('span', { className: 'hdp-badge', key: 't' }, d.battery.temperature + '°C'));
        }
        devices.push(react.createElement('div', {
          key: d.id,
          className: 'hdp-dev' + (isPref ? ' hdp-dev-pref' : ''),
          title: '点击设为默认设备',
          onClick: function () { select(d.id); },
        },
          react.createElement('div', { className: 'hdp-dev-main' },
            react.createElement('div', { className: 'hdp-dev-name' },
              (d.name || d.model || d.id),
              react.createElement('span', { className: 'hdp-dev-id' }, ' ' + d.id),
              isPref ? react.createElement('span', { className: 'hdp-badge hdp-badge-pref' }, ' 默认') : null
            ),
            react.createElement('div', { className: 'hdp-dev-sub' }, subBadges)
          )
        ));
      });

      var sys = (s && s.system) || {};
      var kv = [];
      if (sys.mem && sys.mem.availMB) kv.push(react.createElement('span', { key: 'mem' }, '内存可用 ' + sys.mem.availMB + '/' + (sys.mem.totalMB || '?') + ' MB'));
      if (sys.storage) kv.push(react.createElement('span', { key: 'st' }, '存储已用 ' + sys.storage.usePct));
      if (sys.display) kv.push(react.createElement('span', { key: 'dp' }, '分辨率 ' + sys.display.w + '×' + sys.display.h));
      var osVer = (s && s.devices && s.devices.length ? ((s.devices.find(function (x) { return x.id === pref; }) || s.devices[0]).softwareVersion) : '') || '';
      if (osVer) kv.push(react.createElement('span', { key: 'os' }, 'OS ' + osVer));

      var hilog = (s && s.hilog) || {};

      var body;
      if (err) {
        body = react.createElement('div', { className: 'hdp-err' }, '面板数据通道不可用：host 半边需升级插件（重启 DSH 后生效） ' + err);
      } else if (!s) {
        body = react.createElement('div', { className: 'hdp-hint' }, '正在获取设备状态…');
      } else {
        body = react.createElement('div', null,
          s.error ? react.createElement('div', { className: 'hdp-hint' }, s.error) : null,
          devices.length ? devices : react.createElement('div', { className: 'hdp-hint' }, '无已连接设备（连接指引：hdc_connect 127.0.0.1:5555）'),
          kv.length ? react.createElement('div', { className: 'hdp-sys' }, kv) : null,
          hilog.available && hilog.lines.length ? react.createElement('pre', { className: 'hdp-pre' }, hilog.lines.join(NL)) : null,
          s.lastError ? react.createElement('div', { className: 'hdp-err' }, s.lastError) : null
        );
      }

      return react.createElement('span', { className: 'hdp-root', ref: rootRef },
        react.createElement('button', {
          type: 'button',
          className: 'hdp-pill',
          'aria-label': '鸿蒙开发面板',
          'aria-haspopup': 'dialog',
          'aria-expanded': open,
          onClick: function () { setOpen(!open); },
          onMouseEnter: function () { setTip(true); },
          onMouseLeave: function () { setTip(false); },
        },
          react.createElement('span', { className: dotClass }),
          react.createElement('span', { className: 'hdp-pill-label' }, label)
        ),
        react.createElement('div', { className: 'hdp-tip', role: 'tooltip', 'data-show': tip && !open, 'aria-hidden': open }, tipText),
        open ? react.createElement('div', { className: 'hdp-pop', role: 'dialog', 'aria-label': '鸿蒙开发面板' },
          react.createElement('div', { className: 'hdp-pop-head' },
            react.createElement('span', { className: 'hdp-pop-title' }, '鸿蒙开发面板'),
            react.createElement('button', { type: 'button', className: 'hdp-btn', disabled: busy, onClick: refresh }, busy ? '刷新…' : '刷新')
          ),
          react.createElement('div', { className: 'hdp-tools' },
            react.createElement('span', { className: 'hdp-tools-label' }, '本地工具链'),
            toolBadges
          ),
          react.createElement('div', { className: 'hdp-pop-body' }, body),
          react.createElement('div', { className: 'hdp-foot' }, s ? '更新 ' + fmtTime(s.updatedAt) : '')
        ) : null
      );
    }

    function apply(ctx) {
      ctx.effect(function () { injectStyles(); }, 'hdc-bridge pill: styles');
      ctx.slots.inject('conversation.input.right', function () {
        return ctx.slots.register(
          { name: 'conversation.input.right', id: 'hdc-bridge-pill', order: -1 },
          function () { return react.createElement(HarmonyPill, null); },
        );
      });
    }

    exports.apply = apply;
    exports.inject = ['slots'];
    return module.exports;
  }
});
