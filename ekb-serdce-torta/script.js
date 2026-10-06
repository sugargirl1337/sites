(() => {
  const cfg = JSON.parse(document.getElementById('cfg').textContent);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // staggered entrance: hero on load, sections on scroll
  document.querySelectorAll('[data-d]').forEach((el) => el.style.setProperty('--d', reduce ? '0ms' : `${el.dataset.d}ms`));
  requestAnimationFrame(() => document.querySelector('.hero').classList.add('is-in'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('.rise').forEach((el, i) => {
        if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', reduce ? '0ms' : `${i * 60}ms`);
      });
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('section').forEach((s) => io.observe(s));

  // signature tool: collect parameters into a ready-made request
  const form = document.getElementById('tool-form');
  if (!form) return;
  const lines = document.getElementById('lines');

  const read = () => cfg.fields.map((f) => {
    if (f.type === 'range') {
      const v = form.elements[f.id].value;
      document.getElementById(`${f.id}-out`).textContent = v;
      return [f.title, `${v} ${f.unit}`];
    }
    if (f.type === 'multi') {
      const v = [...form.querySelectorAll(`[name="${f.id}"]:checked`)].map((i) => i.value);
      return [f.title, v.length ? v.join(', ') : 'не выбрано'];
    }
    const el = form.elements[f.id];
    let v = el ? (el.value || '').trim() : '';
    if (f.type === 'date' && v) v = v.split('-').reverse().join('.');
    return [f.title, v || 'не указано'];
  });

  const render = () => {
    lines.innerHTML = '';
    read().forEach(([k, v]) => {
      const li = document.createElement('li');
      const a = document.createElement('span');
      const b = document.createElement('b');
      a.textContent = k; b.textContent = v;
      li.append(a, b); lines.append(li);
    });
  };
  form.addEventListener('input', render);
  form.addEventListener('change', render);
  render();

  const message = () => [cfg.greeting, ...read().map(([k, v]) => `${k}: ${v}`)].join('\n');

  document.querySelectorAll('[data-send]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const kind = btn.dataset.send;
      const text = message();
      if (kind === 'whatsapp') {
        e.preventDefault();
        window.open(`https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
        return;
      }
      const note = document.getElementById('copied');
      try {
        await navigator.clipboard.writeText(text);
        note.textContent = 'Текст заявки скопирован, вставьте его в чат';
      } catch (_) {
        note.textContent = 'Автоматически скопировать не удалось. Скопируйте текст ниже и вставьте в чат.';
        let fallback = document.getElementById('request-copy');
        if (!fallback) {
          fallback = document.createElement('textarea');
          fallback.id = 'request-copy';
          fallback.className = 'text';
          fallback.rows = 8;
          fallback.readOnly = true;
          fallback.setAttribute('aria-label', 'Текст обращения для копирования');
          note.parentElement.after(fallback);
        }
        fallback.value = text;
      }
    });
  });
})();
