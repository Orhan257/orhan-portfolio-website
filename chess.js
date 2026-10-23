// De 3D-weergave wordt pas geladen wanneer het bord in beeld komt.
const panel = document.querySelector('.chess-playground');
const status = panel.querySelector('.chess-status');
const observer = new IntersectionObserver(async ([entry]) => {
  if (!entry.isIntersecting) return;
  observer.disconnect();
  try {
    const THREE = await import('./assets/vendor/three.module.min.js');
    startChess(THREE);
  } catch (error) {
    status.textContent = 'De 3D-weergave is niet beschikbaar in deze browser.';
    console.error(error);
  }
}, { rootMargin: '200px' });
observer.observe(panel);

function startChess(T) {
  const stage = panel.querySelector('.chess-stage');
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-label', '3D-schaakbord. Sleep om te draaien. Klik een stuk en daarna een veld. Gebruik pijltjestoetsen om te draaien.');
  stage.replaceChildren(canvas);
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(38, 1, 0.1, 100);
  scene.add(new T.HemisphereLight(0xdceaff, 0x26354b, 3));
  const key = new T.DirectionalLight(0xfff4e7, 4);
  key.position.set(3, 12, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 });
  key.shadow.bias = -0.001;
  scene.add(key);
  const rim = new T.DirectionalLight(0x6aaaff, 3);
  rim.position.set(-6, 5, -5);
  scene.add(rim);
  const material = (color, metalness = 0.15) => new T.MeshStandardMaterial({ color, metalness, roughness: 0.32 });
  const white = material(0xe2ecfa, 0.25);
  const black = material(0x244a78, 0.4);
  const tiles = [], pieces = [];
  const labels = { pawn: 'pion', rook: 'toren', knight: 'paard', bishop: 'loper', queen: 'koningin', king: 'koning' };
  const order = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  const squareName = (c, r) => 'abcdefgh'[c] + (8 - r);
  const at = (c, r) => pieces.find(p => p.visible && p.userData.c === c && p.userData.r === r);
  let selected = null, yaw = 0.35, pitch = 0.88, distance = 16;
  let frame = null;
  function draw() {
    if (frame !== null) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      const fittedDistance = distance * Math.max(1, 1.1 / camera.aspect);
      camera.position.set(fittedDistance * Math.sin(yaw) * Math.cos(pitch), fittedDistance * Math.sin(pitch), fittedDistance * Math.cos(yaw) * Math.cos(pitch));
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    });
  }
  function mesh(geometry, mat, parent, x = 0, y = 0, z = 0) {
    const m = new T.Mesh(geometry, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  mesh(new T.BoxGeometry(8.6, 0.3, 8.6), material(0x14283e), scene, 0, -0.22);
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const tile = mesh(new T.BoxGeometry(0.995, 0.12, 0.995), material((r + c) % 2 ? 0x30567b : 0x91b2d2), scene, c - 3.5, -0.02, r - 3.5);
      tile.userData = { c, r };
      tiles.push(tile);
    }
  }
  // Alle stukken bestaan uit echte volumes, ook vanaf de achterkant.
  function makePiece(type, side, c, r) {
    const group = new T.Group();
    const mat = side === 'white' ? white : black;
    const add = (geo, y, x = 0, z = 0) => mesh(geo, mat, group, x, y, z);
    const cylinder = (top, bottom, height, y) => add(new T.CylinderGeometry(top, bottom, height, 32), y);
    cylinder(0.29, 0.33, 0.12, 0.1);
    cylinder(0.24, 0.29, 0.1, 0.21);
    const h = type === 'pawn' ? 0.5 : type === 'king' ? 0.95 : 0.8;
    const profile = [[0.24, 0.25], [0.19, 0.3], [0.13, h - 0.12], [0.2, h], [0.2, h + 0.06]];
    if (type !== 'knight') add(new T.LatheGeometry(profile.map(([x, y]) => new T.Vector2(x, y)), 32), 0);
    if (type === 'pawn') add(new T.SphereGeometry(0.2, 24, 16), 0.72);
    if (type === 'rook') {
      cylinder(0.28, 0.22, 0.16, 0.94);
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3;
        const block = add(new T.BoxGeometry(0.14, 0.17, 0.15), 1.08, Math.sin(a) * 0.21, Math.cos(a) * 0.21);
        block.rotation.y = a;
      }
    }
    if (type === 'bishop') {
      const head = add(new T.SphereGeometry(0.22, 24, 20), 1.03);
      head.scale.set(0.85, 1.5, 0.85);
      add(new T.SphereGeometry(0.065, 16, 12), 1.38);
      const cut = mesh(new T.BoxGeometry(0.045, 0.26, 0.025), material(0x17304e), group, 0, 1.12, 0.177);
      cut.rotation.z = -0.5;
    }
    if (type === 'queen') {
      cylinder(0.27, 0.15, 0.23, 1.02);
      for (let i = 0; i < 7; i++) {
        const a = i * Math.PI * 2 / 7;
        add(new T.SphereGeometry(0.065, 12, 8), 1.19, Math.sin(a) * 0.23, Math.cos(a) * 0.23);
      }
      add(new T.SphereGeometry(0.09, 16, 12), 1.22);
    }
    if (type === 'king') {
      cylinder(0.25, 0.2, 0.12, 1.08);
      add(new T.BoxGeometry(0.1, 0.4, 0.1), 1.36);
      add(new T.BoxGeometry(0.31, 0.1, 0.1), 1.42);
    }
    if (type === 'knight') {
      const shape = new T.Shape();
      shape.moveTo(-0.24, 0.29);
      [[0.25, 0.29], [0.27, 0.72], [0.12, 1.12], [-0.06, 1.27], [-0.13, 1.08], [-0.34, 0.91], [-0.4, 0.74], [-0.22, 0.68], [0.02, 0.83], [-0.13, 0.56]].forEach(([x, y]) => shape.lineTo(x, y));
      shape.closePath();
      const head = add(new T.ExtrudeGeometry(shape, { depth: 0.23, bevelEnabled: true, bevelSize: 0.045, bevelThickness: 0.04, bevelSegments: 2, steps: 1 }), 0, 0, -0.115);
      for (const z of [-0.16, 0.16]) mesh(new T.SphereGeometry(0.035, 12, 8), material(0x0b1528), group, -0.09, 0.98, z);
      group.rotation.y = side === 'white' ? Math.PI / 2 : -Math.PI / 2;
    }
    group.userData = { type, side, c, r, initialC: c, initialR: r };
    group.position.set(c - 3.5, 0.05, r - 3.5);
    scene.add(group);
    pieces.push(group);
  }
  for (let c = 0; c < 8; c++) {
    makePiece(order[c], 'black', c, 0);
    makePiece('pawn', 'black', c, 1);
    makePiece('pawn', 'white', c, 6);
    makePiece(order[c], 'white', c, 7);
  }
  const marker = mesh(new T.RingGeometry(0.34, 0.44, 40), new T.MeshBasicMaterial({ color: 0xf6cf70, side: T.DoubleSide }), scene);
  marker.rotation.x = -Math.PI / 2;
  marker.visible = false;
  function update() {
    marker.visible = !!selected;
    if (selected) marker.position.set(selected.position.x, 0.065, selected.position.z);
    draw();
  }
  function select(piece) {
    selected = piece;
    if (piece) {
      const d = piece.userData;
      status.textContent = `${labels[d.type]} op ${squareName(d.c, d.r)} geselecteerd. Kies een doelveld.`;
    }
    update();
  }
  function move(piece, c, r) {
    const d = piece.userData, target = at(c, r);
    if (target === piece) { select(null); status.textContent = 'Selectie opgeheven.'; return; }
    if (target && target.userData.side === d.side) { select(target); return; }
    if (target) target.visible = false;
    const origin = squareName(d.c, d.r);
    Object.assign(d, { c, r });
    piece.position.set(c - 3.5, 0.05, r - 3.5);
    selected = null;
    status.textContent = `${labels[d.type]}: ${origin} → ${squareName(c, r)}${target ? ' · stuk geslagen' : ''}.`;
    update();
  }
  const ray = new T.Raycaster();
  function pick(event) {
    const rect = canvas.getBoundingClientRect();
    ray.setFromCamera(new T.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1), camera);
    const hits = ray.intersectObjects([...pieces.filter(p => p.visible), ...tiles], true);
    if (!hits.length) { select(null); return; }
    let object = hits[0].object;
    while (object.parent && object.userData.c === undefined) object = object.parent;
    const { c, r } = object.userData;
    if (c === undefined) return;
    if (selected) move(selected, c, r);
    else if (at(c, r)) select(at(c, r));
  }
  // Een klik verplaatst; een sleepbeweging draait de camera.
  let drag = null;
  canvas.addEventListener('pointerdown', e => {
    if (e.button !== 0 || drag) return;
    canvas.focus({ preventScroll: true });
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, yaw, pitch, moved: false };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.hypot(dx, dy) > 5) drag.moved = true;
    if (!drag.moved) return;
    yaw = drag.yaw - dx * 0.008;
    pitch = T.MathUtils.clamp(drag.pitch + dy * 0.008, 0.25, 1.4);
    draw();
  });
  canvas.addEventListener('pointerup', e => {
    if (!drag || drag.id !== e.pointerId) return;
    const clicked = !drag.moved;
    drag = null;
    canvas.releasePointerCapture(e.pointerId);
    if (clicked) pick(e);
  });
  canvas.addEventListener('pointercancel', () => { drag = null; });
  canvas.addEventListener('lostpointercapture', () => { drag = null; });
  canvas.addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Escape'].includes(e.key)) return;
    e.preventDefault();
    if (e.key === 'Escape') select(null);
    if (e.key === 'ArrowLeft') yaw -= 0.15;
    if (e.key === 'ArrowRight') yaw += 0.15;
    if (e.key === 'ArrowUp') pitch = Math.min(1.4, pitch + 0.1);
    if (e.key === 'ArrowDown') pitch = Math.max(0.25, pitch - 0.1);
    draw();
  });
  new ResizeObserver(() => {
    const { width, height } = stage.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    draw();
  }).observe(stage);
  canvas.addEventListener('webglcontextlost', e => {
    e.preventDefault();
    status.textContent = 'De 3D-weergave is onderbroken. Vernieuw de pagina om verder te gaan.';
  });
  status.textContent = 'Kies een stuk en daarna een veld. Beide kleuren zijn vrij te verplaatsen.';
  update();
}
