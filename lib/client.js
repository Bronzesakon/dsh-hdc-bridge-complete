// dsh-hdc-bridge browser bundle. The input-row capsule owns an anchored panel
// directly above itself, so the surface never becomes a draggable window.
window.__ModuleLoader__.load({
  id: 'dsh-hdc-bridge',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    var React = require('react');
    var NL = String.fromCharCode(10);
    var POLL_FAST = 8000;
    var POLL_SLOW = 20000;
    var POLL_CLOSED = 60000;

    var CSS = [
      '.hdcp-root{display:inline-flex;position:relative;flex:none;font:12px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;color:var(--dsw-alias-label-primary,#e9e9ef);}',
      '.hdcp-pill{height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 10px;border:1px solid var(--dsw-alias-border-l2,#3a3d46);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary,#9ba0ab);font:12px/1 system-ui,-apple-system,Segoe UI,sans-serif;cursor:pointer;white-space:nowrap;}',
      '.hdcp-pill:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.06));color:var(--dsw-alias-label-primary,#e9e9ef);}',
      '.hdcp-entry-dot,.hdcp-dot,.hdcp-dev-state{width:8px;height:8px;border-radius:50%;flex:0 0 auto;background:var(--dsw-alias-label-quaternary,#8a8f99);}',
      '.hdcp-dot-ok{background:var(--dsw-alias-state-success-primary,#34c759);}',
      '.hdcp-dot-err{background:var(--dsw-alias-state-error-primary,#ff5252);}',
      '.hdcp-dot-warn{background:var(--dsw-alias-state-warn-primary,#ffb020);}',
      '.hdcp-pill-label{overflow:hidden;text-overflow:ellipsis;}',
      '.hdcp-panel{position:absolute;right:0;bottom:calc(100% + 8px);z-index:1000;width:360px;max-width:calc(100vw - 16px);max-height:min(560px,calc(100vh - 112px));pointer-events:auto;}',
      '.hdcp-card{display:flex;flex-direction:column;max-height:inherit;overflow:hidden;background:var(--dsw-alias-bg-layer-3,#23252c);border:1px solid var(--dsw-alias-border-l2,#3a3d46);border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.38);}',
      '.hdcp-head{display:flex;align-items:center;gap:8px;padding:9px 10px;border-bottom:1px solid var(--dsw-alias-border-l2,#3a3d46);}',
      '.hdcp-title{min-width:0;flex:1 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600;}',
      '.hdcp-btn{min-width:24px;height:24px;padding:0 6px;background:transparent;border:1px solid var(--dsw-alias-border-l2,#3a3d46);border-radius:6px;color:inherit;font:11px/1 system-ui,-apple-system,Segoe UI,sans-serif;cursor:pointer;flex:0 0 auto;}',
      '.hdcp-btn:hover,.hdcp-dev-shot:hover{background:var(--dsw-alias-interactive-bg-hover,#2c2e37);}',
      '.hdcp-btn:disabled{opacity:.5;cursor:default;}',
      '.hdcp-tools{display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:8px 10px;border-bottom:1px solid var(--dsw-alias-border-l2,#3a3d46);}',
      '.hdcp-tools-label{margin-right:2px;color:var(--dsw-alias-label-tertiary,#9ba0ab);font-size:11px;}',
      '.hdcp-tool-badge,.hdcp-badge{display:inline-flex;align-items:center;min-height:18px;box-sizing:border-box;padding:0 6px;border-radius:4px;background:var(--dsw-alias-fill-tsp-secondary,rgba(255,255,255,.08));color:var(--dsw-alias-state-business-primary,#8fb3f5);font-size:11px;line-height:16px;}',
      '.hdcp-badge-pref{background:var(--dsw-alias-state-success-secondary,rgba(52,199,89,.20));color:var(--dsw-alias-label-primary,#e9e9ef);}',
      '.hdcp-body{min-height:0;max-height:400px;overflow:auto;padding:9px 10px;--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);}',
      '.hdcp-hint{margin:2px 0 6px;color:var(--dsw-alias-label-tertiary,#9ba0ab);}',
      '.hdcp-dev{display:flex;align-items:flex-start;gap:7px;padding:6px 4px;border-bottom:1px solid var(--dsw-alias-separator-primary,rgba(255,255,255,.06));border-radius:4px;cursor:pointer;}',
      '.hdcp-dev:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.05));}',
      '.hdcp-dev-pref{background:var(--dsw-alias-fill-tsp-secondary,rgba(90,150,255,.10));}',
      '.hdcp-dev-state{margin-top:5px;width:7px;height:7px;}',
      '.hdcp-dev-state.on{background:var(--dsw-alias-state-success-primary,#34c759);}',
      '.hdcp-dev-main{min-width:0;flex:1 1 auto;}',
      '.hdcp-dev-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.hdcp-dev-id{margin-left:4px;color:var(--dsw-alias-label-quaternary,#9ba0ab);font:11px/1.2 ui-monospace,Consolas,monospace;}',
      '.hdcp-dev-sub{display:flex;flex-wrap:wrap;gap:4px;margin-top:3px;}',
      '.hdcp-dev-shot{height:23px;padding:0 6px;background:transparent;border:1px solid var(--dsw-alias-border-l2,#3a3d46);border-radius:6px;color:inherit;font:11px/1 system-ui,-apple-system,Segoe UI,sans-serif;cursor:pointer;flex:0 0 auto;}',
      '.hdcp-sys{display:grid;grid-template-columns:1fr 1fr;gap:4px 10px;margin:8px 0;padding:7px 8px;border-radius:6px;background:var(--dsw-alias-bg-layer-2,rgba(255,255,255,.03));color:var(--dsw-alias-label-secondary,#9ba0ab);font-size:11px;}',
      '.hdcp-shot{position:relative;margin-top:8px;}',
      '.hdcp-shot img{display:block;max-width:100%;border:1px solid var(--dsw-alias-border-l2,#3a3d46);border-radius:6px;}',
      '.hdcp-shot-label{margin-bottom:3px;color:var(--dsw-alias-label-tertiary,#9ba0ab);font-size:11px;}',
      '.hdcp-shot-close{position:absolute;top:22px;right:4px;width:22px;height:22px;padding:0;border:0;border-radius:50%;background:rgba(0,0,0,.6);color:#fff;font-size:14px;line-height:1;cursor:pointer;}',
      '.hdcp-pre{max-height:160px;overflow:auto;margin:8px 0 0;padding:6px;border-radius:6px;background:var(--dsw-alias-markdown-code-block,#16171c);font:10px/1.4 ui-monospace,Consolas,monospace;white-space:pre-wrap;word-break:break-all;--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);}',
      '.hdcp-foot{margin-top:7px;color:var(--dsw-alias-label-tertiary,#9ba0ab);font-size:11px;}',
      '.hdcp-err{margin-top:5px;color:var(--dsw-alias-state-error-primary,#ff6b6b);font-size:11px;}',
      '.hdcp-btn:focus-visible,.hdcp-pill:focus-visible,.hdcp-dev-shot:focus-visible,.hdcp-shot-close:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#3d7bfd);outline-offset:1px;}',
      '@media (max-width:480px){.hdcp-panel{right:-4px;width:calc(100vw - 16px)}.hdcp-body{max-height:calc(100vh - 180px)}}',
    ].join('');

    function injectStyles() {
      var tagId = 'dsh-hdc-bridge/panel.css';
      if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css=' + JSON.stringify(tagId) + ']') === null) {
        var tag = document.createElement('style');
        tag.setAttribute('data-plugin-css', tagId);
        tag.textContent = CSS;
        document.head.appendChild(tag);
      }
    }
    function dotClass(state, err) {
      if (err || (state && (state.error || state.lastError))) return 'hdcp-dot-warn';
      if (state && state.devices && state.devices.length) return 'hdcp-dot-ok';
      return 'hdcp-dot-err';
    }
    function fmtTime(ms) {
      var date = new Date(ms);
      return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
    }
    function PhoneIcon() {
      return React.createElement('svg', { width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true' },
        React.createElement('rect', { x: 3.5, y: 1, width: 9, height: 14, rx: 2, stroke: 'currentColor', strokeWidth: 1.2 }),
        React.createElement('line', { x1: 6, y1: 12.5, x2: 10, y2: 12.5, stroke: 'currentColor', strokeWidth: 1.2 })
      );
    }

    function usePanelData(open) {
      var statePair = React.useState(null);
      var errorPair = React.useState('');
      var busyPair = React.useState(false);
      var state = statePair[0], setState = statePair[1];
      var err = errorPair[0], setErr = errorPair[1];
      var shotBusy = busyPair[0], setShotBusy = busyPair[1];
      var devCount = state && state.devices ? state.devices.length : 0;
      React.useEffect(function () {
        var dead = false;
        function poll() {
          fetch('/api2/hdc-bridge/panel-state')
            .then(function (response) { if (!response.ok) throw new Error('HTTP ' + response.status); return response.json(); })
            .then(function (next) { if (!dead) { setErr(''); setState(next); } })
            .catch(function (error) { if (!dead) setErr(String(error && error.message ? error.message : error)); });
        }
        poll();
        var interval = open ? (devCount > 0 ? POLL_FAST : POLL_SLOW) : POLL_CLOSED;
        var timer = setInterval(poll, interval);
        return function () { dead = true; clearInterval(timer); };
      }, [open, devCount]);
      function refresh(shot, target) {
        if (shot) setShotBusy(true);
        fetch('/api2/hdc-bridge/refresh', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shot: !!shot, target: target || '' }) })
          .then(function (response) { if (!response.ok) throw new Error('HTTP ' + response.status); return response.json(); })
          .then(function (next) { setErr(''); setState(next); })
          .catch(function (error) { setErr(String(error && error.message ? error.message : error)); })
          .finally(function () { setShotBusy(false); });
      }
      function select(id) {
        fetch('/api2/hdc-bridge/select', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target: id }) })
          .then(function (response) { if (!response.ok) throw new Error('HTTP ' + response.status); return response.json(); })
          .then(function (next) { setErr(''); setState(next); })
          .catch(function () { /* the next poll restores state */ });
      }
      return { state: state, err: err, shotBusy: shotBusy, refresh: refresh, select: select };
    }

    function PanelSurface(props) {
      var data = props.data;
      var state = data.state || {};
      var shotPair = React.useState(false);
      var shotHidden = shotPair[0], setShotHidden = shotPair[1];
      var title = '鸿蒙开发面板' + (state.hdc ? ' · ' + state.hdc : '');
      var toolchain = state.toolchain || {};
      var badges = [];
      if (state.version) badges.push(React.createElement('span', { className: 'hdcp-tool-badge', key: 'version' }, 'v' + state.version));
      if (toolchain.studio) badges.push(React.createElement('span', { className: 'hdcp-tool-badge', key: 'studio' }, 'Studio ' + toolchain.studio));
      if (toolchain.sdk) badges.push(React.createElement('span', { className: 'hdcp-tool-badge', key: 'sdk' }, 'SDK API ' + toolchain.sdk));
      badges.push(React.createElement('span', { className: 'hdcp-tool-badge', key: 'cli' }, 'devecocli ' + (toolchain.devecocli ? '有' : '无')));
      if (toolchain.knowledge) badges.push(React.createElement('span', { className: 'hdcp-tool-badge', key: 'knowledge' }, '离线知识 ' + toolchain.knowledge + ' 篇'));

      var devices = (state.devices || []).slice().sort(function (left, right) {
        if (left.id === state.preferred) return -1;
        if (right.id === state.preferred) return 1;
        return 0;
      });
      var deviceRows = devices.map(function (device) {
        var preferred = state.preferred === device.id;
        var details = [];
        if (device.model) details.push(React.createElement('span', { className: 'hdcp-badge', key: 'model' }, device.model));
        if (device.apiVersion) details.push(React.createElement('span', { className: 'hdcp-badge', key: 'api' }, 'API ' + device.apiVersion));
        if (device.battery) {
          details.push(React.createElement('span', { className: 'hdcp-badge', key: 'battery' }, '电池 ' + device.battery.capacity + '%'));
          if (device.battery.charging) details.push(React.createElement('span', { className: 'hdcp-badge', key: 'charging' }, '充电中'));
          if (device.battery.temperature !== null && device.battery.temperature !== undefined) details.push(React.createElement('span', { className: 'hdcp-badge', key: 'temperature' }, device.battery.temperature + '°C'));
        }
        return React.createElement('div', {
          key: device.id, className: 'hdcp-dev' + (preferred ? ' hdcp-dev-pref' : ''), title: '点击设为默认设备',
          onClick: function () { data.select(device.id); },
        },
          React.createElement('span', { className: 'hdcp-dev-state' + (/connected/i.test(device.state) ? ' on' : '') }),
          React.createElement('div', { className: 'hdcp-dev-main' },
            React.createElement('div', { className: 'hdcp-dev-name' },
              device.name || device.model || device.id,
              React.createElement('span', { className: 'hdcp-dev-id' }, device.id),
              preferred ? React.createElement('span', { className: 'hdcp-badge hdcp-badge-pref' }, '默认') : null
            ),
            details.length ? React.createElement('div', { className: 'hdcp-dev-sub' }, details) : null
          ),
          React.createElement('button', {
            type: 'button', className: 'hdcp-dev-shot', disabled: data.shotBusy, title: '截取此设备',
            onClick: function (event) { event.stopPropagation(); setShotHidden(false); data.refresh(true, device.id); },
          }, data.shotBusy ? '截取中' : '截图')
        );
      });

      var system = state.system || {};
      var systemInfo = [];
      if (system.mem && system.mem.availMB) systemInfo.push(React.createElement('span', { key: 'memory' }, '内存可用 ' + system.mem.availMB + '/' + (system.mem.totalMB || '?') + ' MB'));
      if (system.storage) systemInfo.push(React.createElement('span', { key: 'storage' }, '存储已用 ' + system.storage.usePct));
      if (system.display) systemInfo.push(React.createElement('span', { key: 'display' }, '分辨率 ' + system.display.w + '×' + system.display.h));
      var primary = devices.find(function (device) { return device.id === (state.preferred || ''); }) || devices[0];
      if (primary && primary.softwareVersion) systemInfo.push(React.createElement('span', { key: 'system' }, 'OS ' + primary.softwareVersion));
      var screenshot = state.screenshot && state.screenshot.available && !shotHidden ? state.screenshot : null;
      var logs = state.hilog && state.hilog.available && state.hilog.lines ? state.hilog.lines : [];
      var body = [];
      if (devices.length) {
        body.push(React.createElement('div', { key: 'devices' }, deviceRows));
        if (systemInfo.length) body.push(React.createElement('div', { className: 'hdcp-sys', key: 'system' }, systemInfo));
        if (screenshot) body.push(React.createElement('div', { className: 'hdcp-shot', key: 'screenshot' },
          React.createElement('div', { className: 'hdcp-shot-label' }, '截图 @ ' + screenshot.target),
          React.createElement('img', { src: screenshot.url, alt: '设备截图' }),
          React.createElement('button', { type: 'button', className: 'hdcp-shot-close', onClick: function () { setShotHidden(true); }, title: '关闭截图' }, '×')
        ));
        if (logs.length) body.push(React.createElement('pre', { className: 'hdcp-pre', key: 'logs' }, logs.join(NL)));
        body.push(React.createElement('div', { className: 'hdcp-foot', key: 'time' }, '更新 ' + fmtTime(state.updatedAt || Date.now())));
      } else {
        body.push(React.createElement('div', { className: 'hdcp-hint', key: 'empty' }, state.error || data.err || '无已连接设备（连接指引：hdc_connect 127.0.0.1:5555）'));
      }
      if (state.lastError || data.err) body.push(React.createElement('div', { className: 'hdcp-err', key: 'error' }, state.lastError || data.err));

      return React.createElement('div', { className: 'hdcp-panel', role: 'dialog', 'aria-label': '鸿蒙开发面板' },
        React.createElement('div', { className: 'hdcp-card' },
          React.createElement('div', { className: 'hdcp-head' },
            React.createElement('span', { className: 'hdcp-dot ' + dotClass(state, data.err) }),
            React.createElement('span', { className: 'hdcp-title' }, title),
            React.createElement('button', { type: 'button', className: 'hdcp-btn', disabled: data.shotBusy, onClick: function () { setShotHidden(false); data.refresh(true, ''); } }, data.shotBusy ? '截取中' : '截图'),
            React.createElement('button', { type: 'button', className: 'hdcp-btn', disabled: data.shotBusy, onClick: function () { data.refresh(false, ''); } }, '刷新'),
            React.createElement('button', { type: 'button', className: 'hdcp-btn', onClick: props.onClose, title: '关闭' }, '×')
          ),
          React.createElement('div', { className: 'hdcp-tools' }, React.createElement('span', { className: 'hdcp-tools-label' }, '本地工具链'), badges),
          React.createElement('div', { className: 'hdcp-body' }, body)
        )
      );
    }

    function HarmonyPill() {
      var openPair = React.useState(false);
      var open = openPair[0], setOpen = openPair[1];
      var rootRef = React.useRef(null);
      var data = usePanelData(open);
      React.useEffect(function () {
        if (!open) return undefined;
        function onPointerDown(event) {
          if (rootRef.current && rootRef.current.contains && rootRef.current.contains(event.target)) return;
          setOpen(false);
        }
        function onKeyDown(event) { if (event.key === 'Escape') setOpen(false); }
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return function () {
          document.removeEventListener('pointerdown', onPointerDown);
          document.removeEventListener('keydown', onKeyDown);
        };
      }, [open]);
      var count = data.state && data.state.devices ? data.state.devices.length : 0;
      var label = data.err ? '鸿蒙异常' : (count ? '鸿蒙 · ' + count + ' 设备' : '鸿蒙');
      return React.createElement('span', { className: 'hdcp-root', ref: rootRef },
        React.createElement('button', {
          type: 'button', className: 'hdcp-pill', 'aria-label': '鸿蒙开发面板', 'aria-haspopup': 'dialog', 'aria-expanded': open,
          title: '鸿蒙开发面板', onClick: function () { setOpen(function (value) { return !value; }); },
        },
          PhoneIcon(),
          React.createElement('span', { className: 'hdcp-entry-dot ' + dotClass(data.state, data.err) }),
          React.createElement('span', { className: 'hdcp-pill-label' }, label)
        ),
        open ? React.createElement(PanelSurface, { data: data, onClose: function () { setOpen(false); } }) : null
      );
    }

    var inject = ['slots'];
    function apply(ctx) {
      injectStyles();
      ctx.slots.inject('conversation.input.right', function () {
        return ctx.slots.register(
          { name: 'conversation.input.right', id: 'hdc-bridge-pill', order: -1 },
          HarmonyPill
        );
      });
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
