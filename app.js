/* Carpeta del Proyecto — Control de Inserción de Trama */

/* ---------- demostración de la grilla ---------- */
const FILAS = 6, COLS = 3;
let grid = Array.from({length: FILAS}, () => Array(COLS).fill(0));
let tocando = false, timer = null, filaActual = -1;
const $grid = document.getElementById('grid');
const $out  = document.getElementById('out');

function dibujar() {
  if (!$grid) return;
  $grid.style.gridTemplateColumns = `48px repeat(${COLS}, auto)`;
  $grid.innerHTML = '';
  for (let f = 0; f < FILAS; f++) {
    const l = document.createElement('div');
    l.className = 'rl'; l.textContent = `fila ${f + 1}`;
    $grid.appendChild(l);
    for (let c = 0; c < COLS; c++) {
      const cel = document.createElement('div');
      cel.className = 'cel' + (grid[f][c] ? ' on' : '') + (f === filaActual ? ' now' : '');
      cel.textContent = grid[f][c] ? '1' : '';
      cel.onclick = () => { grid[f][c] = grid[f][c] ? 0 : 1; dibujar(); };
      $grid.appendChild(cel);
    }
  }
}
const activos = f => f.reduce((a, v, i) => (v ? [...a, i + 1] : a), []);

function paso() {
  if (!tocando) return;
  filaActual = (filaActual + 1) % FILAS;
  const a = activos(grid[filaActual]);
  const linea = a.length
    ? `pasada ${filaActual + 1}  →  se activan: ${a.join(', ')}`
    : `pasada ${filaActual + 1}  →  ninguno se activa`;
  const prev = $out.textContent.split('\n').slice(-6).join('\n');
  $out.textContent = (prev ? prev + '\n' : '') + linea;
  dibujar();
  timer = setTimeout(paso, 700);
}
function detener() {
  tocando = false; clearTimeout(timer); filaActual = -1;
  const b = document.getElementById('play');
  if (b) b.textContent = '▶ Reproducir';
  dibujar();
}
if ($grid) {
  document.getElementById('play').onclick = () => {
    if (tocando) return detener();
    if (grid.every(f => f.every(v => !v))) {
      $out.textContent = 'La grilla está vacía.\n\nTocá algunas celdas o cargá el ejemplo.';
      return;
    }
    tocando = true;
    document.getElementById('play').textContent = '⏸ Pausar';
    filaActual = -1; $out.textContent = ''; paso();
  };
  document.getElementById('clear').onclick = () => {
    detener();
    grid = Array.from({length: FILAS}, () => Array(COLS).fill(0));
    dibujar(); $out.textContent = 'Grilla vacía.';
  };
  document.getElementById('ejemplo').onclick = () => {
    detener();
    grid = [[1,0,1],[0,1,0],[1,0,1],[0,1,0],[1,1,0],[0,0,1]];
    dibujar();
    $out.textContent = 'Ejemplo cargado: una raya repetitiva.\n\nApretá reproducir para verlo en ejecución.';
  };
  dibujar();
}

/* ---------- navegación ---------- */
const enlaces = [...document.querySelectorAll('#nav a')];
const destinos = enlaces.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
function marcar() {
  const y = scrollY + 120;
  let act = null;
  destinos.forEach(d => { if (d.offsetTop <= y) act = d; });
  enlaces.forEach(a => a.classList.toggle('on', act && a.getAttribute('href') === '#' + act.id));
}
addEventListener('scroll', marcar); marcar();

const mt = document.getElementById('mt'), sb = document.getElementById('sb');
if (mt) {
  mt.onclick = () => sb.classList.toggle('open');
  enlaces.forEach(a => a.addEventListener('click', () => sb.classList.remove('open')));
}

/* ---------- comprobación de lectura ---------- */
const P = [
  { q: 'En la matriz del dibujo, ¿qué representa una fila?',
    o: ['Un marco del telar', 'Una pasada completa', 'Un rollo de hilo', 'Un ciclo del motor'], ok: 1,
    fb: 'Cada fila equivale a una pasada. Las columnas de esa fila son los elementos que se activan de forma simultánea en ese momento, no posiciones que se recorren una por una.' },
  { q: 'Si se corta la conexión mientras el telar está tejiendo, ¿qué hace el sistema?',
    o: ['Detiene la máquina de inmediato', 'Sigue enviando las últimas órdenes', 'No acciona ningún relé', 'Reinicia el patrón desde el comienzo'], ok: 2,
    fb: 'El firmware es fail-safe: sin comunicación no acciona nada. El telar permanece como estaba y la botonera sigue operable manualmente.' },
  { q: '¿Por qué cada canal de relé lleva una resistencia de polarización?',
    o: ['Para limitar la corriente de la bobina', 'Para evitar que el relé se accione al encender', 'Para filtrar el ruido de los motores', 'Para reducir los 24 V a 3,3 V'], ok: 1,
    fb: 'Al arrancar el microcontrolador, sus pines quedan un instante sin definir. La resistencia mantiene el relé en reposo durante ese lapso. Según la polaridad del módulo, va conectada a 3,3 V o a masa.' }
];
const $q = document.getElementById('quiz');
let idx = 0, ok = 0;
function pregunta() {
  if (!$q) return;
  if (idx >= P.length) {
    const m = ok === 3 ? 'Correcto en todo: el modelo quedó claro.'
            : ok === 2 ? 'Muy bien. Conviene repasar el punto que quedó pendiente.'
            : 'Vale la pena releer los apartados 3.2.4 y 4.6, donde está el fundamento.';
    $q.innerHTML = `<h5>${ok} de ${P.length} correctas</h5><p>${m}</p>
      <button class="btn g" onclick="reiniciar()">Volver a empezar</button>`;
    return;
  }
  const p = P[idx];
  $q.innerHTML = `<h5>${idx + 1}. ${p.q}</h5>` +
    p.o.map((t, i) => `<button class="opt" data-i="${i}">${t}</button>`).join('') + `<div class="fb" id="fb"></div>`;
  $q.querySelectorAll('.opt').forEach(b => {
    b.onclick = () => {
      const i = +b.dataset.i;
      $q.querySelectorAll('.opt').forEach((x, j) => {
        x.disabled = true;
        if (j === p.ok) x.classList.add('ok'); else if (j === i) x.classList.add('bad');
      });
      if (i === p.ok) ok++;
      document.getElementById('fb').innerHTML =
        `${p.fb} <button class="btn" style="margin-top:.6rem" onclick="siguiente()">Siguiente</button>`;
    };
  });
}
function siguiente() { idx++; pregunta(); }
function reiniciar() { idx = 0; ok = 0; pregunta(); }
pregunta();

/* ---------- lightbox de la galería ---------- */
const lb = document.getElementById('lb');
if (lb) {
  const lbimg = document.getElementById('lbimg');
  const lbcap = document.getElementById('lbcap');
  document.querySelectorAll('.gal img').forEach(img => {
    img.addEventListener('click', () => {
      lbimg.src = img.src;
      const cap = img.parentElement.querySelector('figcaption');
      lbcap.textContent = cap ? cap.textContent : '';
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });
  const cerrar = () => { lb.classList.remove('open'); document.body.style.overflow = ''; };
  lb.addEventListener('click', cerrar);
  addEventListener('keydown', e => { if (e.key === 'Escape') cerrar(); });
}

/* ---------- modo oscuro ---------- */
const btnTema = document.getElementById('tema');
if (btnTema) {
  const ico = document.getElementById('tema-ico');
  const txt = document.getElementById('tema-txt');
  const pintar = (t) => {
    document.documentElement.setAttribute('data-tema', t);
    ico.textContent = t === 'oscuro' ? '☀' : '◐';
    txt.textContent = t === 'oscuro' ? 'Modo claro' : 'Modo oscuro';
  };
  // Arranca según lo que prefiera el sistema; el usuario puede cambiarlo.
  const prefiereOscuro = matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
  pintar(prefiereOscuro ? 'oscuro' : 'claro');
  btnTema.onclick = () => {
    const actual = document.documentElement.getAttribute('data-tema');
    pintar(actual === 'oscuro' ? 'claro' : 'oscuro');
  };
}

/* ---------- buscador del índice ---------- */
const buscar = document.getElementById('buscar');
if (buscar) {
  const enlacesNav = [...document.querySelectorAll('#nav a')];
  const grupos = [...document.querySelectorAll('#nav .ngr')];
  let sinRes = null;
  buscar.addEventListener('input', () => {
    const q = buscar.value.trim().toLowerCase();
    let visibles = 0;
    enlacesNav.forEach(a => {
      const coincide = !q || a.textContent.toLowerCase().includes(q);
      a.classList.toggle('oculto', !coincide);
      if (coincide) visibles++;
    });
    // Un grupo se oculta si ninguno de sus enlaces quedó visible.
    grupos.forEach(g => {
      let hay = false;
      let el = g.nextElementSibling;
      while (el && !el.classList.contains('ngr')) {
        if (el.tagName === 'A' && !el.classList.contains('oculto')) hay = true;
        el = el.nextElementSibling;
      }
      g.classList.toggle('oculto', !hay);
    });
    if (!sinRes) {
      sinRes = document.createElement('div');
      sinRes.className = 'sin-res';
      sinRes.textContent = 'Sin resultados';
      document.getElementById('nav').appendChild(sinRes);
    }
    sinRes.style.display = (q && visibles === 0) ? 'block' : 'none';
  });
}
