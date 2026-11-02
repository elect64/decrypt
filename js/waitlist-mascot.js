/* ==========================================================
   DECRYPT 3.0 — WAITLIST MASCOT
   ========================================================== */
(() => {
  const canvas = document.getElementById('waitlist-mascot');
  const stage = canvas && canvas.parentElement;
  const fallback = document.getElementById('mascot-fallback');
  if (!canvas || !stage) return;

  if (!window.THREE) {
    canvas.hidden = true;
    fallback.hidden = false;
    return;
  }

  const THREE = window.THREE;
  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  } catch (error) {
    canvas.hidden = true;
    fallback.hidden = false;
    return;
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#FFFFFF');
  const camera = new THREE.PerspectiveCamera(29, 16 / 9, 0.1, 50);
  camera.position.set(0, 1.42, 6.1);
  camera.lookAt(0, 1.15, 0);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor('#FFFFFF', 1);
  renderer.outputEncoding = THREE.sRGBEncoding;

  scene.add(new THREE.HemisphereLight(0xFFFFFF, 0x809487, 1.5));
  const keyLight = new THREE.DirectionalLight(0xFFFFFF, 1.9);
  keyLight.position.set(-3.5, 5, 5);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xD6F1DF, 0.8);
  fillLight.position.set(4, 2.5, 2);
  scene.add(fillLight);

  const material = (color, roughness = 0.55, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const shell = material('#B9E0C5', 0.34, 0.04);
  const green = material('#2D8057', 0.38, 0.05);
  const dark = material('#172A20', 0.4);
  const orange = material('#F15D3D', 0.4);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(0.76, 48), new THREE.MeshBasicMaterial({ color: '#DDE6DE', transparent: true, opacity: 0.72 }));
  floor.rotation.x = -Math.PI / 2;
  floor.scale.set(1.25, 0.5, 1);
  floor.position.y = 0.015;
  scene.add(floor);

  const mascot = new THREE.Group();
  scene.add(mascot);
  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 24), shell);
  torso.scale.set(0.87, 1.08, 0.72);
  torso.position.y = 0.91;
  mascot.add(torso);

  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.105, 24, 18), green);
  chest.scale.set(1, 1.1, 0.34);
  chest.position.set(0, 0.92, 0.29);
  mascot.add(chest);
  const badge = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), orange);
  badge.position.set(0, 0.92, 0.326);
  mascot.add(badge);

  function makeLeg(x) {
    const leg = new THREE.Group();
    leg.position.set(x, 0.53, 0);
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.34, 20), green);
    shin.position.y = -0.13;
    leg.add(shin);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 16), shell);
    foot.scale.set(1.18, 0.7, 1.25);
    foot.position.set(0, -0.3, 0.045);
    leg.add(foot);
    mascot.add(leg);
  }
  makeLeg(-0.15);
  makeLeg(0.15);

  function makeArm(x) {
    const arm = new THREE.Group();
    arm.position.set(x, 1.2, 0);
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.105, 0.38, 20), green);
    upperArm.position.y = -0.19;
    arm.add(upperArm);
    const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.105, 20, 16), shell);
    elbow.position.y = -0.39;
    arm.add(elbow);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.14, 24, 18), shell);
    hand.scale.set(1, 0.92, 0.8);
    hand.position.set(0, -0.5, 0.025);
    arm.add(hand);
    const thumb = new THREE.Mesh(new THREE.CylinderGeometry(0.047, 0.052, 0.2, 16), shell);
    thumb.position.set(0.105, -0.47, 0.04);
    thumb.rotation.z = -Math.PI / 2;
    arm.add(thumb);
    mascot.add(arm);
    return arm;
  }
  const leftArm = makeArm(-0.34);
  const rightArm = makeArm(0.34);

  const head = new THREE.Group();
  head.position.set(0, 1.68, 0);
  mascot.add(head);
  const headShell = new THREE.Mesh(new THREE.SphereGeometry(0.45, 40, 32), shell);
  headShell.scale.set(1, 0.93, 0.82);
  head.add(headShell);
  const crown = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), green);
  crown.scale.set(1, 0.48, 0.9);
  crown.position.set(0, 0.35, 0.015);
  head.add(crown);
  const antennaStem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.15, 12), green);
  antennaStem.position.y = 0.46;
  head.add(antennaStem);
  const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.065, 20, 16), orange);
  antennaTip.position.y = 0.56;
  head.add(antennaTip);

  const openEyes = new THREE.Group();
  const closedEyes = new THREE.Group();
  for (const x of [-0.155, 0.155]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.052, 20, 16), dark);
    eye.scale.set(0.78, 1, 0.42);
    eye.position.set(x, 0.015, 0.355);
    openEyes.add(eye);

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x - 0.045, 0, 0.355),
      new THREE.Vector3(x, -0.018, 0.36),
      new THREE.Vector3(x + 0.045, 0, 0.355)
    ]);
    const closedEye = new THREE.Mesh(new THREE.TubeGeometry(curve, 8, 0.009, 5, false), dark);
    closedEyes.add(closedEye);
  }
  head.add(openEyes, closedEyes);
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.027, 16, 12), dark);
  mouth.scale.set(1.5, 0.55, 0.4);
  mouth.position.set(0, -0.13, 0.357);
  head.add(mouth);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let frameId = 0;
  let startedAt = 0;

  function ease(start, end, value) {
    const t = THREE.MathUtils.clamp((value - start) / (end - start), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function resize() {
    const bounds = stage.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    renderer.setSize(bounds.width, bounds.height, false);
    camera.aspect = bounds.width / bounds.height;
    camera.updateProjectionMatrix();
  }

  function renderAt(time) {
    const cycle = time % 7.4;
    const awake = ease(0.75, 1.45, cycle) * (1 - ease(5.65, 6.35, cycle));
    const thumbsUp = ease(1.35, 2.05, cycle) * (1 - ease(4.7, 5.35, cycle));
    const settling = ease(5.55, 6.35, cycle);
    const blink = cycle > 3.25 && cycle < 3.42;
    const pose = cycle < 0.75 || cycle >= 6.35
      ? 'sleeping'
      : cycle < 1.45
        ? 'waking'
        : cycle < 4.7
          ? 'thumbs-up'
          : 'falling-asleep';

    canvas.dataset.pose = pose;
    canvas.setAttribute('aria-label', `A 3D DECRYPT mascot is ${pose.replace('-', ' ')}.`);
    mascot.position.y = 0.018 * Math.sin(cycle * 2.2) * awake;
    head.rotation.z = 0.2 * (1 - awake) + 0.23 * settling;
    head.rotation.x = -0.04 * awake + 0.08 * settling;
    openEyes.visible = awake > 0.4 && !blink;
    closedEyes.visible = !openEyes.visible;
    mouth.scale.x = 1.5 + 2.2 * awake;
    rightArm.rotation.z = 2.28 * thumbsUp;
    rightArm.rotation.x = -0.16 * thumbsUp;
    leftArm.rotation.z = -0.08 + 0.1 * Math.sin(cycle * 2) * awake;

    renderer.render(scene, camera);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  resize();
  renderAt(0);

  function animate(now) {
    renderAt((now - startedAt) / 1000);
    frameId = window.requestAnimationFrame(animate);
  }

  window.WaitlistMascot = {
    play() {
      this.pause();
      if (reducedMotion) {
        renderAt(2.8);
        return;
      }
      startedAt = performance.now();
      frameId = window.requestAnimationFrame(animate);
    },
    pause() {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
    }
  };
})();