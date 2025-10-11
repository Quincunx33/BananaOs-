/*! Banana Optimization Engine v3.1 - Full (UI + Core) - ENHANCED */
/*! Banana Optimization Engine v3.1 - Full (UI + Core) - ENHANCED */
/* Features:
   - FPS & memory monitor, dynamic FPS scaler
   - Virtual DOM diff & patch (lightweight)
   - Advanced Virtual Scroller
   - requestIdleCallback scheduler + task queue
   - Web Worker offload (worker file expected banana_worker.js)
   - Lazy-loading manager (images & components)
   - Settings UI: floating round button, dark theme panel, ON/OFF toggle, run cleaner, show stats
   - LocalStorage persistence for settings
   - Performance logger & basic reporter (no external telemetry)
   - Compatibility helpers and safe init
   - ENHANCED: Advanced worker integration with timeout, batch processing, health checks
*/
(function(global){
  'use strict';
  var doc = document, win = window, ns = 'BananaOptV3';
  
  // FIX: BananaOpt variable declaration at the top
  var BananaOpt = global.BananaOpt || {};
  
  // Basic config and defaults
  var cfg = {
    enabled: true,
    autoMode: true,
    statsVisible: false,
    targetFPS: 55,
    memoryThresholdMB: 200,
    virtualListBuffer: 5,
    workerTimeout: 30000
  };

  // load saved config
  try{ var s = localStorage.getItem(ns+'-cfg'); if(s) Object.assign(cfg, JSON.parse(s)); }catch(e){}

  // Util helpers
  function now(){ return performance && performance.now ? performance.now() : Date.now(); }
  function isFn(v){ return typeof v === 'function'; }
  function saveCfg(){ try{ localStorage.setItem(ns+'-cfg', JSON.stringify(cfg)); }catch(e){} }
  function css(el, obj){ for(var k in obj) try{ el.style[k]=obj[k]; }catch(e){} }

  /* ---------- Task Scheduler (RIC + fallback) ---------- */
  var ric = win.requestIdleCallback || function(cb){ return setTimeout(function(){ cb({didTimeout:false,timeRemaining:function(){return 50;}}); }, 50); };
  var ricCancel = win.cancelIdleCallback || clearTimeout;
  var taskQueue = [];
  function scheduleIdleTask(fn, opts){
    if(!isFn(fn)) return;
    if(opts && opts.priority === 'high') { // run faster via timeout
      return setTimeout(fn, opts.delay||100);
    }
    var id = ric(function(){ try{ fn(); }catch(e){} });
    return id;
  }

  /* ---------- RAF Batcher & Write/Read separation ---------- */
  var rafQ = [], rafScheduled=false;
  function rafBatch(fn){
    rafQ.push(fn);
    if(!rafScheduled){
      rafScheduled = true;
      win.requestAnimationFrame(function(){
        rafScheduled=false; var q=rafQ; rafQ=[];
        for(var i=0;i<q.length;i++){ try{ q[i](); }catch(e){} }
      });
    }
  }

  /* ---------- FPS Monitor & Dynamic Scaler ---------- */
  var fps = {lastTime: now(), frames:0, current:60, history:[]};
  function fpsTick(){
    var t = now();
    fps.frames++;
    if(t - fps.lastTime >= 500){
      fps.current = Math.round((fps.frames*1000)/(t-fps.lastTime));
      fps.history.push(fps.current);
      if(fps.history.length>50) fps.history.shift();
      fps.frames = 0;
      fps.lastTime = t;
      // adjust if enabled & autoMode
      if(cfg.enabled && cfg.autoMode){
        if(fps.current < Math.max(20, cfg.targetFPS-20)){
          enterLowPowerMode();
        } else {
          exitLowPowerMode();
        }
      }
      if(ui) ui.updateStats();
    }
    win.requestAnimationFrame(fpsTick);
  }

  var lowPower = false;
  function enterLowPowerMode(){
    if(lowPower) return; lowPower=true;
    // relax render frequency or defer heavy tasks
    // Example: set global flag
    BananaOpt.lowPower = true;
    // reduce target operations: we will throttle scroll handlers more aggressively
  }
  function exitLowPowerMode(){
    if(!lowPower) return; lowPower=false;
    BananaOpt.lowPower = false;
  }

  /* ---------- Lightweight Virtual DOM (diff + patch) ---------- */
  function h(tag, props, children){ return {tag:tag, props:props||{}, children: children||[]}; }
  function createEl(vnode){
    if(typeof vnode === 'string' || typeof vnode === 'number'){ return doc.createTextNode(String(vnode)); }
    var el = doc.createElement(vnode.tag);
    for(var k in vnode.props) try{ el.setAttribute(k, vnode.props[k]); }catch(e){};
    (vnode.children||[]).forEach(function(ch){ el.appendChild(createEl(ch)); });
    return el;
  }
  function diff(oldV, newV){
    // returns patches: simple implementation
    var patches = [];
    if(oldV===newV) return patches;
    if(typeof oldV === 'string' || typeof newV === 'string' || typeof oldV === 'number' || typeof newV === 'number'){
      if(String(oldV)!==String(newV)) patches.push({type:'replace', value:newV});
      return patches;
    }
    if(oldV.tag !== newV.tag){ patches.push({type:'replace', value:newV}); return patches; }
    // props: shallow compare
    var propP=[];
    for(var k in newV.props) if(newV.props[k] !== (oldV.props||{})[k]) propP.push({k:k,v:newV.props[k]});
    for(var k in oldV.props) if(!(k in (newV.props||{}))) propP.push({k:k,v:undefined});
    if(propP.length) patches.push({type:'props', props:propP});
    // children naive strategy: if length differs, replace, else diff recursively
    var oldC = oldV.children||[], newC = newV.children||[];
    if(oldC.length !== newC.length){ patches.push({type:'replace', value:newV}); return patches; }
    // child diffs
    var childP = [];
    for(var i=0;i<oldC.length;i++){ var cp = diff(oldC[i], newC[i]); if(cp && cp.length) childP.push({i:i,patch:cp}); }
    if(childP.length) patches.push({type:'children', patches:childP});
    return patches;
  }
  function patch(el, patches){
    if(!patches || !patches.length) return;
    for(var i=0;i<patches.length;i++){
      var p = patches[i];
      if(p.type==='replace'){ var n = createEl(p.value); el.parentNode.replaceChild(n, el); return; }
      if(p.type==='props'){ p.props.forEach(function(pp){ if(pp.v===undefined) el.removeAttribute(pp.k); else el.setAttribute(pp.k, pp.v); }); }
      if(p.type==='children'){ p.patches.forEach(function(ch){ patch(el.childNodes[ch.i], ch.patch); }); }
    }
  }

  /* ---------- Virtual Scroller (improved) ---------- */
  function VirtualScroller(container, options){
    options = options || {};
    var itemHeight = options.itemHeight || 48;
    var buffer = options.buffer || cfg.virtualListBuffer;
    var items = options.items || [];
    var renderItem = options.renderItem || function(i){ var d = doc.createElement('div'); d.textContent = items[i]; return d; };
    container.style.position = container.style.position || 'relative';
    var spacer = doc.createElement('div'); spacer.style.width='1px'; spacer.style.height = (items.length*itemHeight)+'px';
    container.innerHTML=''; container.appendChild(spacer);
    var rendered = {}, frag = doc.createDocumentFragment();
    function render(){
      var st = container.scrollTop, h = container.clientHeight || win.innerHeight;
      var start = Math.max(0, Math.floor(st/itemHeight)-buffer), end = Math.min(items.length-1, Math.ceil((st+h)/itemHeight)+buffer);
      // remove old
      Object.keys(rendered).forEach(function(k){ var idx = parseInt(k,10); if(idx<start || idx> end){ try{ container.removeChild(rendered[k]); }catch(e){} delete rendered[k]; } });
      for(var i=start;i<=end;i++){ if(!rendered[i]){ var node = renderItem(i); node.style.position='absolute'; node.style.top = (i*itemHeight)+'px'; node.style.width='100%'; rendered[i]=node; frag.appendChild(node); } }
      if(frag.childNodes.length) rafBatch(function(){ container.appendChild(frag); frag = doc.createDocumentFragment(); });
    }
    container.addEventListener('scroll', function(){ if(cfg.enabled) render(); }, {passive:true});
    win.addEventListener('resize', debounce(function(){ if(cfg.enabled) render(); }, 120));
    render();
    return {refresh: render, destroy: function(){ container.innerHTML=''; }};
  }

  /* ---------- Lazy Loader (components + images) ---------- */
  function lazyLoadImages(root){
    root = root || doc;
    var imgs = Array.prototype.slice.call(root.querySelectorAll('img[data-src],img[data-srcset]'));
    if('IntersectionObserver' in win){
      var io = new IntersectionObserver(function(entries){ entries.forEach(function(ent){ if(ent.isIntersecting){ var img = ent.target; if(img.dataset.src) img.src=img.dataset.src; if(img.dataset.srcset) img.srcset=img.dataset.srcset; img.decoding='async'; img.removeAttribute('data-src'); img.removeAttribute('data-srcset'); io.unobserve(img); } }); }, {rootMargin:'400px 0px', threshold:0.01});
      imgs.forEach(function(i){ io.observe(i); });
    } else {
      imgs.forEach(function(img){ scheduleIdleTask(function(){ if(img.dataset.src) img.src=img.dataset.src; if(img.dataset.srcset) img.srcset=img.dataset.srcset; img.decoding='async'; }); });
    }
  }

  /* ---------- Web Worker Offload (bridge) ---------- */
  var workerSupported = !!win.Worker;
  var worker = null;
  // FIX: Correct worker file path
  try{ if(workerSupported) worker = new Worker('banana_worker.js'); }catch(e){ workerSupported=false; worker=null; }
  
  // Original offload function (callback-based)
  function offload(task, data, cb){
    if(!workerSupported || !worker){ if(cb) scheduleIdleTask(function(){ cb(new Error('no worker'), null); }); return; }
    var id = Math.random().toString(36).slice(2);
    function onmsg(e){ if(e.data && e.data._id === id){ worker.removeEventListener('message', onmsg); try{ cb(null, e.data.result); }catch(e){} } }
    worker.addEventListener('message', onmsg);
    worker.postMessage({ _id:id, task:task, data:data });
  }

  /* ---------- ENHANCED: Advanced Worker Integration ---------- */
  function setupAdvancedWorker() {
    if (!workerSupported) return;
    
    // Enhanced offload function with Promise and timeout
    BananaOpt.offloadAdvanced = function(task, data, options) {
      options = options || {};
      return new Promise(function(resolve, reject) {
        if (!workerSupported || !worker) {
          reject(new Error('Web Worker not supported'));
          return;
        }
        
        var id = Math.random().toString(36).slice(2);
        var timeout = options.timeout || cfg.workerTimeout;
        
        var timeoutId = setTimeout(function() {
          worker.removeEventListener('message', onMessage);
          reject(new Error('Worker task timeout after ' + timeout + 'ms'));
        }, timeout);
        
        function onMessage(e) {
          if (e.data && e.data._id === id) {
            clearTimeout(timeoutId);
            worker.removeEventListener('message', onMessage);
            
            if (e.data.error) {
              reject(new Error(e.data.error));
            } else {
              resolve(e.data.result);
            }
          }
        }
        
        worker.addEventListener('message', onMessage);
        worker.postMessage({ 
          _id: id, 
          task: task, 
          data: data,
          options: options
        });
      });
    };
    
    // Batch processing for multiple tasks
    BananaOpt.offloadBatch = async function(tasks) {
      var results = [];
      for (var i = 0; i < tasks.length; i++) {
        var task = tasks[i];
        try {
          var result = await BananaOpt.offloadAdvanced(task.type, task.data, task.options);
          results.push({ success: true, result: result });
        } catch (error) {
          results.push({ success: false, error: error.message });
        }
      }
      return results;
    };

    // Worker health check
    BananaOpt.workerHealthCheck = function() {
      return new Promise(function(resolve) {
        if (!workerSupported || !worker) {
          resolve({ healthy: false, reason: 'Worker not supported' });
          return;
        }
        
        var id = Math.random().toString(36).slice(2);
        var timeoutId = setTimeout(function() {
          worker.removeEventListener('message', onMessage);
          resolve({ healthy: false, reason: 'Timeout' });
        }, 5000);
        
        function onMessage(e) {
          if (e.data && e.data._id === id) {
            clearTimeout(timeoutId);
            worker.removeEventListener('message', onMessage);
            resolve({ 
              healthy: true, 
              timestamp: e.data.timestamp,
              workerTime: e.data.workerTime
            });
          }
        }
        
        worker.addEventListener('message', onMessage);
        worker.postMessage({ 
          _id: id, 
          task: 'ping',
          data: { timestamp: Date.now() }
        });
      });
    };

    // Worker statistics
    BananaOpt.getWorkerStats = function() {
      return {
        supported: workerSupported,
        active: !!worker,
        tasksProcessed: workerTasksProcessed || 0,
        lastHealthCheck: workerLastHealthCheck || null
      };
    };

    console.log('🍌 Advanced Worker Integration - LOADED');
  }

  // Worker task counter
  var workerTasksProcessed = 0;
  var workerLastHealthCheck = null;

  /* ---------- Memory Watcher & Cleaner ---------- */
  var memory = {last:0};
  function checkMemory(){
    try{
      if(performance && performance.memory){
        var usedMB = Math.round(performance.memory.usedJSHeapSize/1024/1024);
        memory.last = usedMB;
        if(usedMB > cfg.memoryThresholdMB) { runMemoryCleaner(); }
        if(ui) ui.updateStats();
      }
    }catch(e){}
  }
  function runMemoryCleaner(){
    // basic cleanup: remove data-clean-listeners, call user-specified cleanup, clear caches
    document.querySelectorAll('[data-clean-listeners]').forEach(function(el){ try{ var list = JSON.parse(el.getAttribute('data-clean-listeners')||'[]'); list.forEach(function(info){ if(el._handlers && el._handlers[info.type]) el.removeEventListener(info.type, el._handlers[info.type]); }); el.removeAttribute('data-clean-listeners'); }catch(e){} });
    // GC hint by dropping caches
    BananaOpt._cache = {}; // clear internal cache
    // schedule small timeout to free
    setTimeout(function(){ try{ if(window.gc) window.gc(); }catch(e){} }, 200);
  }

  /* ---------- Event utils: debounce + throttleRAF ---------- */
  function debounce(fn, wait, immediate){
    var t; return function(){ var ctx=this,args=arguments; var later=function(){ t=null; if(!immediate) fn.apply(ctx,args); }; var callNow = immediate && !t; clearTimeout(t); t=setTimeout(later, wait||100); if(callNow) fn.apply(ctx,args); };
  }
  function throttleRAF(fn){ var busy=false,lastArgs=null,lastThis=null; return function(){ lastArgs=arguments; lastThis=this; if(!busy){ busy=true; win.requestAnimationFrame(function(){ busy=false; fn.apply(lastThis,lastArgs); }); } }; }

  /* ---------- Simple Resource Cache (in-memory + ls optional) ---------- */
  BananaOpt._cache = {};
  function cacheSet(k,v){ try{ BananaOpt._cache[k]=v; }catch(e){} }
  function cacheGet(k){ return BananaOpt._cache[k]; }

  /* ---------- iOS Style AssistiveTouch UI ---------- */
  var ui = null;
  var isUIVisible = true;
  var uiTimeout = null;

  function createUI(){
      try{
          // iOS style floating button styles
          var style = doc.createElement('style');
          style.id = 'banana-opt-style';
          style.textContent = `
          .banana-opt-btn{
              position: fixed;
              left: 20px;
              bottom: 100px;
              width: 60px;
              height: 60px;
              border-radius: 30px;
              background: rgba(255, 218, 87, 0.9);
              backdrop-filter: blur(10px);
              border: 2px solid rgba(255, 255, 255, 0.3);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: move;
              z-index: 2147483647;
              transition: all 0.3s ease;
              opacity: 0.7;
          }
          .banana-opt-btn:hover, .banana-opt-btn:active{
              opacity: 1;
              transform: scale(1.1);
              background: rgba(255, 218, 87, 0.95);
          }
          .banana-opt-btn.hidden{
              opacity: 0.3;
              transform: scale(0.8);
          }
          .banana-opt-btn svg{
              width: 28px;
              height: 28px;
              filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
          }
          .banana-opt-panel{
              position: fixed;
              left: 90px;
              bottom: 90px;
              width: 280px;
              background: rgba(17, 17, 17, 0.95);
              backdrop-filter: blur(20px);
              color: #eee;
              border-radius: 20px;
              padding: 16px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
              border: 1px solid rgba(255, 255, 255, 0.1);
              z-index: 2147483646;
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
              opacity: 0;
              transform: translateX(-20px);
              transition: all 0.3s ease;
              pointer-events: none;
          }
          .banana-opt-panel.show{
              opacity: 1;
              transform: translateX(0);
              pointer-events: all;
          }
          .banana-opt-row{
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 12px 8px;
              border-bottom: 1px solid rgba(255,255,255,0.1);
          }
          .banana-opt-row:last-child{
              border-bottom: none;
          }
          .banana-opt-toggle{
              width: 52px;
              height: 32px;
              border-radius: 16px;
              background: rgba(255,255,255,0.2);
              display: inline-block;
              position: relative;
              cursor: pointer;
              transition: all 0.3s ease;
          }
          .banana-opt-toggle .knob{
              position: absolute;
              left: 4px;
              top: 4px;
              width: 24px;
              height: 24px;
              border-radius: 12px;
              background: #fff;
              transition: all 0.3s ease;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          }
          .banana-opt-toggle.on{
              background: linear-gradient(135deg, #24c6dc, #514a9d);
          }
          .banana-opt-toggle.on .knob{
              left: 24px;
              background: #fff;
          }
          .banana-opt-stats{
              font-size: 13px;
              color: rgba(255,255,255,0.7);
              padding: 8px 0;
              font-family: 'Menlo', 'Monaco', monospace;
          }
          .banana-opt-btn.small{
              width: 50px;
              height: 50px;
              border-radius: 25px;
          }
          `;
          doc.head.appendChild(style);

          // Create floating button
          var btn = doc.createElement('div'); 
          btn.className = 'banana-opt-btn';
          btn.setAttribute('aria-label', 'Banana Optimization');
          btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v2" stroke="#000" stroke-width="1.6"/><path d="M12 20v2" stroke="#000" stroke-width="1.6"/><path d="M4.93 4.93l1.41 1.41" stroke="#000" stroke-width="1.6"/><path d="M17.66 17.66l1.41 1.41" stroke="#000" stroke-width="1.6"/><circle cx="12" cy="12" r="3" stroke="#000" stroke-width="1.6"/></svg>';

          // Create panel
          var panel = doc.createElement('div'); 
          panel.className = 'banana-opt-panel';
          panel.innerHTML = `
              <div style="font-weight:600;margin-bottom:12px;font-size:16px;">🍌 Banana Optimization</div>
              <div class="banana-opt-row">
                  <div>Enabled</div>
                  <div class="banana-opt-toggle" id="ban-toggle"><div class="knob"></div></div>
              </div>
              <div class="banana-opt-row">
                  <div>Auto Mode</div>
                  <div class="banana-opt-toggle" id="ban-auto"><div class="knob"></div></div>
              </div>
              <div class="banana-opt-row">
                  <div>Show Stats</div>
                  <div class="banana-opt-toggle" id="ban-stats"><div class="knob"></div></div>
              </div>
              <div class="banana-opt-row">
                  <div>Memory Cleaner</div>
                  <button id="ban-clean" style="background:rgba(255,255,255,0.1);color:#fff;border:none;padding:8px 12px;border-radius:8px;cursor:pointer;font-size:12px;">Run Cleaner</button>
              </div>
              <div class="banana-opt-row">
                  <div>Performance</div>
                  <div class="banana-opt-stats" id="ban-stats-text">-- fps / -- MB</div>
              </div>
              <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:12px;text-align:center;">
                  Drag to move • Tap to open
              </div>
          `;

          doc.body.appendChild(btn);
          doc.body.appendChild(panel);

          // Make button draggable like iOS AssistiveTouch
          makeButtonDraggable(btn);

          // Auto-hide functionality
          setupAutoHide(btn);

          // Button click to show panel
          btn.addEventListener('click', function(e){
              e.stopPropagation();
              panel.classList.toggle('show');
              resetAutoHide();
          });

          // Close panel when clicking outside
          doc.addEventListener('click', function(e){
              if(!panel.contains(e.target) && !btn.contains(e.target)){
                  panel.classList.remove('show');
              }
          });

          // Toggle functionality (existing code)
          var tgl = panel.querySelector('#ban-toggle'), 
              tglA = panel.querySelector('#ban-auto'), 
              tglS = panel.querySelector('#ban-stats'), 
              cleanBtn = panel.querySelector('#ban-clean'), 
              statsText = panel.querySelector('#ban-stats-text');
          
          function setToggle(el, on){ 
              if(on) el.classList.add('on'); 
              else el.classList.remove('on'); 
          }
          
          setToggle(tgl, cfg.enabled); 
          setToggle(tglA, cfg.autoMode); 
          setToggle(tglS, cfg.statsVisible);
          
          tgl.addEventListener('click', function(){ 
              cfg.enabled = !cfg.enabled; 
              setToggle(tgl, cfg.enabled); 
              saveCfg(); 
          });
          
          tglA.addEventListener('click', function(){ 
              cfg.autoMode = !cfg.autoMode; 
              setToggle(tglA, cfg.autoMode); 
              saveCfg(); 
          });
          
          tglS.addEventListener('click', function(){ 
              cfg.statsVisible = !cfg.statsVisible; 
              setToggle(tglS, cfg.statsVisible); 
              saveCfg(); 
              ui.updateStats(); 
          });
          
          cleanBtn.addEventListener('click', function(){ 
              runMemoryCleaner(); 
          });

          // Expose update function
          ui = {
              updateStats: function(){
                  try{
                      var fpsNow = fps.current || '--'; 
                      var mem = '--';
                      if(performance && performance.memory) 
                          mem = Math.round(performance.memory.usedJSHeapSize/1024/1024)+' MB';
                      statsText.textContent = fpsNow + ' fps / ' + mem;
                  }catch(e){};
              }
          };
          
          ui.updateStats();
          return {btn: btn, panel: panel, updateStats: ui.updateStats};
          
      }catch(e){ 
          console.error('UI creation failed:', e);
          return null; 
      }
  }

  /* ---------- Draggable Button like iOS ---------- */
  function makeButtonDraggable(btn){
      var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
      var isDragging = false;
      
      btn.onmousedown = dragMouseDown;
      btn.ontouchstart = dragTouchStart;
      
      function dragMouseDown(e){
          e.preventDefault();
          pos3 = e.clientX;
          pos4 = e.clientY;
          startDrag();
      }
      
      function dragTouchStart(e){
          var touch = e.touches[0];
          pos3 = touch.clientX;
          pos4 = touch.clientY;
          startDrag();
      }
      
      function startDrag(){
          isDragging = true;
          btn.style.transition = 'none';
          btn.style.opacity = '1';
          
          document.onmouseup = closeDragElement;
          document.onmousemove = elementDrag;
          document.ontouchend = closeDragElement;
          document.ontouchmove = elementDragTouch;
          
          resetAutoHide();
      }
      
      function elementDrag(e){
          if(!isDragging) return;
          e.preventDefault();
          pos1 = pos3 - e.clientX;
          pos2 = pos4 - e.clientY;
          pos3 = e.clientX;
          pos4 = e.clientY;
          
          var newTop = btn.offsetTop - pos2;
          var newLeft = btn.offsetLeft - pos1;
          
          // Boundary checking
          var maxTop = window.innerHeight - btn.offsetHeight;
          var maxLeft = window.innerWidth - btn.offsetWidth;
          
          btn.style.top = Math.max(10, Math.min(maxTop-10, newTop)) + "px";
          btn.style.left = Math.max(10, Math.min(maxLeft-10, newLeft)) + "px";
      }
      
      function elementDragTouch(e){
          if(!isDragging) return;
          e.preventDefault();
          var touch = e.touches[0];
          pos1 = pos3 - touch.clientX;
          pos2 = pos4 - touch.clientY;
          pos3 = touch.clientX;
          pos4 = touch.clientY;
          
          var newTop = btn.offsetTop - pos2;
          var newLeft = btn.offsetLeft - pos1;
          
          var maxTop = window.innerHeight - btn.offsetHeight;
          var maxLeft = window.innerWidth - btn.offsetWidth;
          
          btn.style.top = Math.max(10, Math.min(maxTop-10, newTop)) + "px";
          btn.style.left = Math.max(10, Math.min(maxLeft-10, newLeft)) + "px";
      }
      
      function closeDragElement(){
          isDragging = false;
          btn.style.transition = 'all 0.3s ease';
          
          document.onmouseup = null;
          document.onmousemove = null;
          document.ontouchend = null;
          document.ontouchmove = null;
          
          // Restart auto-hide
          startAutoHide();
      }
  }

  /* ---------- Auto-hide like iOS AssistiveTouch ---------- */
  function setupAutoHide(btn){
      startAutoHide();
      
      // Show button when hovering near its position
      btn.addEventListener('mouseenter', function(){
          btn.style.opacity = '1';
          resetAutoHide();
      });
      
      btn.addEventListener('click', resetAutoHide);
  }

  function startAutoHide(){
      if(uiTimeout) clearTimeout(uiTimeout);
      uiTimeout = setTimeout(function(){
          var btn = document.querySelector('.banana-opt-btn');
          if(btn && !btn.classList.contains('hidden')){
              btn.style.opacity = '0.3';
          }
      }, 3000); // Hide after 3 seconds of inactivity
  }

  function resetAutoHide(){
      var btn = document.querySelector('.banana-opt-btn');
      if(btn){
          btn.style.opacity = '0.9';
      }
      startAutoHide();
  }

  /* ---------- Auto-init: find virtual lists and lazy images ---------- */
  function autoInit(){
    try{
      // create UI
      createUI();
      
      // Setup advanced worker features
      setupAdvancedWorker();
      
      // lazy load images
      lazyLoadImages(document);
      
      // setup virtual lists
      Array.prototype.slice.call(document.querySelectorAll('[data-virtual-list]')).forEach(function(el){
        try{
          var items = JSON.parse(el.getAttribute('data-items')||'[]');
          var ih = parseInt(el.getAttribute('data-item-height')||'48',10);
          var vs = VirtualScroller(el, { items: items, itemHeight: ih });
          // store reference
          el.__banana_vs = vs;
        }catch(e){}
      });
      
      // start fps monitor
      win.requestAnimationFrame(fpsTick);
      
      // memory checker
      setInterval(checkMemory, 3000);
      
    }catch(e){}
  }

  // expose core API
  BananaOpt.debounce = debounce; 
  BananaOpt.throttleRAF = throttleRAF; 
  BananaOpt.VirtualScroller = VirtualScroller; 
  BananaOpt.lazyLoadImages = lazyLoadImages; 
  BananaOpt.offload = offload; 
  BananaOpt.offloadAdvanced = BananaOpt.offloadAdvanced; 
  BananaOpt.offloadBatch = BananaOpt.offloadBatch; 
  BananaOpt.workerHealthCheck = BananaOpt.workerHealthCheck; 
  BananaOpt.getWorkerStats = BananaOpt.getWorkerStats; 
  BananaOpt.runMemoryCleaner = runMemoryCleaner; 
  BananaOpt.cfg = cfg;
  
  global.BananaOpt = BananaOpt;

  // init when ready
  if(doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', autoInit);
  } else {
    setTimeout(autoInit, 0);
  }

  // keep some exports for debugging
  try{ 
    window.__BananaOpt__ = BananaOpt; 
    console.log('🍌 Banana Optimization Engine v3.1 - ENHANCED WORKER - LOADED SUCCESSFULLY');
  }catch(e){}
})(window);