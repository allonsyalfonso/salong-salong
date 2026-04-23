(function () {
  'use strict';

  // ── CONSTANTS ──
  var MAP_W = 1408;            // Native map width in px
  var MAP_H = 1993;            // Native map height in px
  var PX_PER_KM = 9.60;        // Calibrated: Tambis ↔ Lawang Kamagong = 140 km (1344 px)
  var PACE = { normal: 20, fast: 30 };  // km/day
  var SNAP_RADIUS = 30;        // pixels (rendered space)
  var REMOVE_RADIUS = 20;      // pixels (rendered space)
  var MAX_WAYPOINTS = 50;

  // ── STATE ──
  // Each waypoint: {x, y (0-100 % of image), name (optional), snappedTo (marker-id or null)}
  var waypoints = [];
  var currentPace = 'normal';
  var currentUnit = 'days';

  // ── DOM REFS (populated on init) ──
  var mapEl, overlayEl, readoutEl;
  var unitDaysBtn, unitKmBtn, paceNormalBtn, paceFastBtn;
  var clearBtn, copyBtn;

  // ── INIT ──
  function init() {
    mapEl = document.getElementById('distance-map');
    if (!mapEl) return;
    overlayEl = mapEl.querySelector('.distance-overlay');
    readoutEl = document.getElementById('distance-readout');
    unitDaysBtn = document.getElementById('distance-unit-days');
    unitKmBtn = document.getElementById('distance-unit-km');
    paceNormalBtn = document.getElementById('distance-pace-normal');
    paceFastBtn = document.getElementById('distance-pace-fast');
    clearBtn = document.getElementById('distance-clear');
    copyBtn = document.getElementById('distance-copy');

    // Wire up events (filled in later tasks)
    mapEl.addEventListener('click', onMapClick);
    // Prevent marker <a> default navigation (distance page markers are snap targets only)
    mapEl.querySelectorAll('.distance-snap-target').forEach(function (m) {
      m.addEventListener('click', function (ev) { ev.preventDefault(); });
    });
    unitDaysBtn.addEventListener('click', function () { setUnit('days'); });
    unitKmBtn.addEventListener('click', function () { setUnit('km'); });
    paceNormalBtn.addEventListener('click', function () { setPace('normal'); });
    paceFastBtn.addEventListener('click', function () { setPace('fast'); });
    clearBtn.addEventListener('click', clearWaypoints);
    copyBtn.addEventListener('click', copyRouteLink);

    // Load from URL if present
    loadFromUrl();
    render();
  }

  // ── DISTANCE MATH ──
  function distanceKm(a, b) {
    var dx = (b.x - a.x) / 100 * MAP_W;
    var dy = (b.y - a.y) / 100 * MAP_H;
    return Math.sqrt(dx*dx + dy*dy) / PX_PER_KM;
  }

  function pathDistanceKm() {
    var total = 0;
    for (var i = 1; i < waypoints.length; i++) {
      total += distanceKm(waypoints[i-1], waypoints[i]);
    }
    return total;
  }

  function directDistanceKm() {
    if (waypoints.length < 2) return 0;
    return distanceKm(waypoints[0], waypoints[waypoints.length - 1]);
  }

  // ── PLACEHOLDERS (filled in later tasks) ──
  function onMapClick(e) {
    // Only respond to left clicks / taps (not right-click etc.)
    if (e.button !== undefined && e.button !== 0) return;

    // Don't handle clicks that originated from markers — we'll intercept markers below
    var imgEl = mapEl.querySelector('picture img');
    if (!imgEl) return;
    var rect = imgEl.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right ||
        e.clientY < rect.top || e.clientY > rect.bottom) {
      return;
    }

    e.preventDefault();

    var clickX = e.clientX;
    var clickY = e.clientY;

    // 1. Check if click is near an existing waypoint (REMOVE)
    for (var i = 0; i < waypoints.length; i++) {
      var wpX = rect.left + waypoints[i].x / 100 * rect.width;
      var wpY = rect.top + waypoints[i].y / 100 * rect.height;
      if (Math.hypot(clickX - wpX, clickY - wpY) < REMOVE_RADIUS) {
        waypoints.splice(i, 1);
        render();
        return;
      }
    }

    // 2. Check if click is near a snap marker (SNAP)
    //    Use the inline left%/top% as the canonical marker position — this is the
    //    same reference the SVG dot will render at, so click-point and render-point
    //    stay in sync. Robust to any CSS transform / cascade weirdness on .map-marker.
    var snapTargets = mapEl.querySelectorAll('.distance-snap-target');
    var closestMarker = null;
    var closestDist = SNAP_RADIUS;
    snapTargets.forEach(function (marker) {
      var mxPct = parseFloat(marker.style.left);
      var myPct = parseFloat(marker.style.top);
      var mx = rect.left + mxPct / 100 * rect.width;
      var my = rect.top + myPct / 100 * rect.height;
      var dist = Math.hypot(clickX - mx, clickY - my);
      if (dist < closestDist) {
        closestDist = dist;
        closestMarker = marker;
      }
    });

    if (closestMarker) {
      if (waypoints.length >= MAX_WAYPOINTS) return;
      var left = parseFloat(closestMarker.style.left);
      var top = parseFloat(closestMarker.style.top);
      waypoints.push({
        x: left,
        y: top,
        name: closestMarker.dataset.markerName,
        snappedTo: closestMarker.dataset.markerId
      });
      render();
      return;
    }

    // 3. Otherwise, free-form waypoint at click position
    if (waypoints.length >= MAX_WAYPOINTS) return;
    var x = (clickX - rect.left) / rect.width * 100;
    var y = (clickY - rect.top) / rect.height * 100;
    waypoints.push({
      x: x,
      y: y,
      name: 'Point ' + (waypoints.length + 1),
      snappedTo: null
    });
    render();
  }
  function setUnit(u) {
    currentUnit = u;
    unitDaysBtn.classList.toggle('active', u === 'days');
    unitKmBtn.classList.toggle('active', u === 'km');
    render();
  }
  function setPace(p) {
    currentPace = p;
    paceNormalBtn.classList.toggle('active', p === 'normal');
    paceFastBtn.classList.toggle('active', p === 'fast');
    render();
  }
  function clearWaypoints() {
    waypoints = [];
    render();
  }
  function copyRouteLink() {
    if (waypoints.length === 0) {
      showNotice('Add some points first.');
      return;
    }
    var encoded = waypoints.map(function (w) {
      var decimals = w.snappedTo ? 1 : 2;
      return w.x.toFixed(decimals) + ',' + w.y.toFixed(decimals);
    }).join(';');
    var url = window.location.origin + window.location.pathname + '?r=' + encoded;

    var originalLabel = copyBtn.textContent;
    var restoreLabel = function () { copyBtn.textContent = originalLabel; };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        copyBtn.textContent = 'Copied!';
        setTimeout(restoreLabel, 1500);
      }).catch(function () {
        fallbackCopy(url);
      });
    } else {
      fallbackCopy(url);
    }
  }

  function fallbackCopy(url) {
    // Create a temporary input so the user can manually copy
    var input = document.createElement('input');
    input.value = url;
    input.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:300;width:80%;max-width:520px;padding:0.5rem;';
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      copyBtn.textContent = 'Copied!';
      setTimeout(function () {
        copyBtn.textContent = 'Copy Link';
        document.body.removeChild(input);
      }, 1500);
    } catch (e) {
      showNotice('Press Ctrl+C to copy this link.');
      setTimeout(function () {
        if (input.parentNode) document.body.removeChild(input);
      }, 5000);
    }
  }

  function showNotice(text) {
    var n = document.createElement('div');
    n.className = 'distance-notice';
    n.textContent = text;
    document.body.appendChild(n);
    // Trigger CSS transition
    setTimeout(function () { n.classList.add('visible'); }, 10);
    setTimeout(function () {
      n.classList.remove('visible');
      setTimeout(function () { if (n.parentNode) document.body.removeChild(n); }, 300);
    }, 2500);
  }
  function loadFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var r = params.get('r');
    if (!r) return;

    var segments = r.split(';').slice(0, MAX_WAYPOINTS);
    var skipped = 0;
    segments.forEach(function (seg) {
      var parts = seg.split(',');
      if (parts.length !== 2) { skipped++; return; }
      var x = parseFloat(parts[0]);
      var y = parseFloat(parts[1]);
      if (isNaN(x) || isNaN(y) || x < 0 || x > 100 || y < 0 || y > 100) {
        skipped++;
        return;
      }
      // Try to match to a snap target (by closest position within 0.5%)
      var snappedMarker = findMarkerAt(x, y);
      if (snappedMarker) {
        waypoints.push({
          x: parseFloat(snappedMarker.style.left),
          y: parseFloat(snappedMarker.style.top),
          name: snappedMarker.dataset.markerName,
          snappedTo: snappedMarker.dataset.markerId
        });
      } else {
        waypoints.push({
          x: x,
          y: y,
          name: 'Point ' + (waypoints.length + 1),
          snappedTo: null
        });
      }
    });

    if (skipped > 0) {
      showNotice(skipped + ' invalid waypoint' + (skipped === 1 ? '' : 's') + ' skipped.');
    }
  }

  function findMarkerAt(x, y) {
    var snapTargets = mapEl.querySelectorAll('.distance-snap-target');
    var match = null;
    snapTargets.forEach(function (marker) {
      var mx = parseFloat(marker.style.left);
      var my = parseFloat(marker.style.top);
      if (Math.abs(mx - x) < 0.5 && Math.abs(my - y) < 0.5) {
        match = marker;
      }
    });
    return match;
  }
  function render() {
    renderOverlay();
    renderReadout();
  }

  function renderOverlay() {
    if (!overlayEl) return;
    // Clear SVG
    while (overlayEl.firstChild) overlayEl.removeChild(overlayEl.firstChild);

    if (waypoints.length === 0) return;

    var SVG = 'http://www.w3.org/2000/svg';

    // Convert waypoint % (0-100) to native viewBox coords (0-MAP_W / 0-MAP_H)
    function vbX(w) { return w.x / 100 * MAP_W; }
    function vbY(w) { return w.y / 100 * MAP_H; }

    // 1. Straight-line (if 2+ points): dashed
    if (waypoints.length >= 2) {
      var first = waypoints[0];
      var last = waypoints[waypoints.length - 1];
      var direct = document.createElementNS(SVG, 'line');
      direct.setAttribute('x1', vbX(first));
      direct.setAttribute('y1', vbY(first));
      direct.setAttribute('x2', vbX(last));
      direct.setAttribute('y2', vbY(last));
      direct.setAttribute('class', 'distance-overlay__direct');
      overlayEl.appendChild(direct);
    }

    // 2. Path polyline
    if (waypoints.length >= 2) {
      var pathStr = waypoints.map(function (w) { return vbX(w) + ',' + vbY(w); }).join(' ');
      var pathEl = document.createElementNS(SVG, 'polyline');
      pathEl.setAttribute('points', pathStr);
      pathEl.setAttribute('class', 'distance-overlay__path');
      overlayEl.appendChild(pathEl);
    }

    // 3. Per-segment distance labels (only when segment >= 15px rendered)
    var imgEl = mapEl.querySelector('picture img');
    var rect = imgEl ? imgEl.getBoundingClientRect() : null;
    for (var i = 1; i < waypoints.length; i++) {
      var a = waypoints[i-1], b = waypoints[i];
      if (rect) {
        var ax = a.x / 100 * rect.width;
        var ay = a.y / 100 * rect.height;
        var bx = b.x / 100 * rect.width;
        var by = b.y / 100 * rect.height;
        if (Math.hypot(bx-ax, by-ay) < 15) continue;
      }
      var mx = (vbX(a) + vbX(b)) / 2;
      var my = (vbY(a) + vbY(b)) / 2;
      var km = distanceKm(a, b);
      var label = document.createElementNS(SVG, 'text');
      label.setAttribute('x', mx);
      label.setAttribute('y', my);
      label.setAttribute('class', 'distance-overlay__label');
      label.textContent = km.toFixed(1) + ' km';
      overlayEl.appendChild(label);
    }

    // 4. Waypoint dots (on top, clickable for removal).
    //    r=14 native pixels ≈ 10-14 CSS px at typical rendered widths.
    waypoints.forEach(function (w) {
      var dot = document.createElementNS(SVG, 'circle');
      dot.setAttribute('cx', vbX(w));
      dot.setAttribute('cy', vbY(w));
      dot.setAttribute('r', 14);
      dot.setAttribute('class', 'distance-overlay__dot');
      overlayEl.appendChild(dot);
    });
  }

  function renderReadout() {
    if (!readoutEl) return;

    if (waypoints.length === 0) {
      readoutEl.innerHTML = '<p class="distance-readout__hint">Tap the map to add points. Tap a marker to snap. Tap a point to remove.</p>';
      return;
    }

    if (waypoints.length === 1) {
      readoutEl.innerHTML = '<p class="distance-readout__hint">Add another point to measure a distance.</p>';
      return;
    }

    var pathKm = pathDistanceKm();
    var directKm = directDistanceKm();
    var pathDaysNormal = pathKm / PACE.normal;
    var pathDaysFast = pathKm / PACE.fast;

    var primaryText, secondaryText;
    if (currentUnit === 'days') {
      var activeDays = currentPace === 'normal' ? pathDaysNormal : pathDaysFast;
      var activePaceLabel = currentPace === 'normal' ? 'normal' : 'fast';
      primaryText = 'Path: ' + formatDays(activeDays) + ' (' + activePaceLabel + ')';
      var otherDays = currentPace === 'normal' ? pathDaysFast : pathDaysNormal;
      var otherPaceLabel = currentPace === 'normal' ? 'fast' : 'normal';
      secondaryText = pathKm.toFixed(1) + ' km · ' + formatDays(otherDays) + ' (' + otherPaceLabel + ') · Direct: ' + directKm.toFixed(1) + ' km';
    } else {
      primaryText = 'Path: ' + pathKm.toFixed(1) + ' km';
      secondaryText = formatDays(pathDaysNormal) + ' (normal) · ' + formatDays(pathDaysFast) + ' (fast) · Direct: ' + directKm.toFixed(1) + ' km';
    }

    readoutEl.innerHTML =
      '<p class="distance-readout__primary">' + primaryText + '</p>' +
      '<p class="distance-readout__secondary">' + secondaryText + '</p>';
  }

  function formatDays(d) {
    if (d < 1) {
      var hours = d * 24;
      return hours.toFixed(1) + ' hrs';
    }
    if (d < 10) return d.toFixed(1) + ' days';
    return Math.round(d) + ' days';
  }

  // ── BOOTSTRAP ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
