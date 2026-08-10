(function(){
  const canvas = document.getElementById('populationCanvas');
  const tooltip = document.getElementById('vizTooltip');
  const legend = document.getElementById('vizLegend');
  if(!canvas || !tooltip || !legend) return;

  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const COLORS = {
    excluded: '#C15B4A',
    engaged: '#3F8C77',
    female: '#C9A24B',
    male: '#3F5B66'
  };

  const clusters = [
    {
      id: 0, name: 'Digitally Excluded', share: 0.431, pctFemale: 0.963, pctExcluded: 0.893,
      cx: 0.20, cy: 0.5, spread: 0.16,
      summary: '43.1% of the sample - 96.3% women - 89.3% formally excluded'
    },
    {
      id: 1, name: 'Connected but Unengaged', share: 0.443, pctFemale: 0.163, pctExcluded: 0.668,
      cx: 0.56, cy: 0.42, spread: 0.18,
      summary: '44.3% of the sample - 16.3% women - 66.8% formally excluded despite near-universal access'
    },
    {
      id: 2, name: 'Advanced Adopters', share: 0.126, pctFemale: 0.103, pctExcluded: 0.008,
      cx: 0.87, cy: 0.58, spread: 0.11,
      summary: '12.6% of the sample - 10.3% women - only 0.8% excluded'
    }
  ];

  const TOTAL_DOTS = 300;
  let dots = [];

  function seededRandom(seed){
    return function(){
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  function buildDots(){
    dots = [];
    const rand = seededRandom(1337);
    clusters.forEach((cl) => {
      const n = Math.round(TOTAL_DOTS * cl.share);
      for(let i = 0; i < n; i++){
        const angle = rand() * Math.PI * 2;
        const r = Math.pow(rand(), 0.5) * cl.spread;
        const x = cl.cx + Math.cos(angle) * r * 1.4;
        const y = cl.cy + Math.sin(angle) * r;
        dots.push({
          x: Math.min(0.97, Math.max(0.03, x)),
          y: Math.min(0.92, Math.max(0.08, y)),
          cluster: cl.id,
          excluded: rand() < cl.pctExcluded,
          female: rand() < cl.pctFemale,
          drift: rand() * Math.PI * 2,
          r: 2.2 + rand() * 1.6
        });
      }
    });
  }

  let mode = 'adoption';
  let W, H, dpr;

  function resize(){
    dpr = window.devicePixelRatio || 1;
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function colorFor(d){
    if(mode === 'adoption') return d.excluded ? COLORS.excluded : COLORS.engaged;
    return d.female ? COLORS.female : COLORS.male;
  }

  let t = 0;
  function draw(){
    ctx.clearRect(0, 0, W, H);
    dots.forEach((d) => {
      const driftX = reduceMotion ? 0 : Math.sin(t * 0.0006 + d.drift) * 2.5;
      const driftY = reduceMotion ? 0 : Math.cos(t * 0.0005 + d.drift) * 2.5;
      const x = d.x * W + driftX;
      const y = d.y * H + driftY;
      ctx.beginPath();
      ctx.arc(x, y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = colorFor(d);
      ctx.globalAlpha = 0.88;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    t += 16;
    if(!reduceMotion) requestAnimationFrame(draw);
  }

  function renderLegend(){
    if(mode === 'adoption'){
      legend.innerHTML =
        '<div class="legend-item"><span class="legend-dot" style="background:' + COLORS.excluded + '"></span> Formally excluded</div>' +
        '<div class="legend-item"><span class="legend-dot" style="background:' + COLORS.engaged + '"></span> Digitally engaged / included</div>';
    } else {
      legend.innerHTML =
        '<div class="legend-item"><span class="legend-dot" style="background:' + COLORS.female + '"></span> Women</div>' +
        '<div class="legend-item"><span class="legend-dot" style="background:' + COLORS.male + '"></span> Men</div>';
    }
  }

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;
    let nearest = null;
    let nearestDist = Infinity;

    clusters.forEach((cl) => {
      const dist = Math.hypot(mx - cl.cx, my - cl.cy);
      if(dist < nearestDist){
        nearestDist = dist;
        nearest = cl;
      }
    });

    if(nearest && nearestDist < 0.3){
      tooltip.innerHTML = '<strong>' + nearest.name + '</strong>' + nearest.summary;
      tooltip.style.left = (e.clientX - rect.left + 16) + 'px';
      tooltip.style.top = (e.clientY - rect.top + 16) + 'px';
      tooltip.style.opacity = '1';
    } else {
      tooltip.style.opacity = '0';
    }
  });

  canvas.addEventListener('mouseleave', () => { tooltip.style.opacity = '0'; });

  document.querySelectorAll('.toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.toggle-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      mode = btn.getAttribute('data-mode');
      renderLegend();
      if(reduceMotion) draw();
    });
  });

  function init(){
    resize();
    buildDots();
    renderLegend();
    draw();
  }

  window.addEventListener('resize', () => { resize(); if(reduceMotion) draw(); });
  window.addEventListener('load', init);
  if(document.readyState === 'complete') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
