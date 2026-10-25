/*
 * Hero background: golden stage haze rendered with a domain-warped fbm shader.
 * Falls back silently to the CSS gradient when WebGL is unavailable.
 */
(function () {
  "use strict";

  var canvas = document.querySelector(".hero__smoke");
  if (!canvas) return;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
  if (!gl) return;

  var VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
  var FRAG = [
    "precision mediump float;",
    "uniform vec2 r;uniform float t;uniform vec2 m;",
    "float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
    "float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);",
    "return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}",
    "float fbm(vec2 p){float v=0.,a=.5;mat2 R=mat2(.8,.6,-.6,.8);",
    "for(int i=0;i<5;i++){v+=a*n(p);p=R*p*2.02;a*=.5;}return v;}",
    "void main(){",
    "  vec2 uv=gl_FragCoord.xy/r;vec2 p=(gl_FragCoord.xy-.5*r)/r.y;",
    "  float T=t*.045;",
    "  vec2 q=vec2(fbm(p*1.6+vec2(0.,-T*2.)),fbm(p*1.6+vec2(5.2,1.3-T)));",
    "  vec2 s=vec2(fbm(p*1.4+3.*q+vec2(1.7,9.2)+T),fbm(p*1.4+3.*q+vec2(8.3,2.8)-T*.7));",
    "  float f=fbm(p*1.2+2.6*s+(m-.5)*.6);",
    "  float spot=smoothstep(1.15,.0,length((uv-vec2(.5+(m.x-.5)*.25,.12))*vec2(1.6,1.)));",
    "  float beam=smoothstep(.5,.0,abs(p.x-(m.x-.5)*.5+(uv.y-.2)*.25))*smoothstep(0.,.9,1.-uv.y);",
    "  float d=f*f*1.6*(.35+spot*.9+beam*.35);",
    "  vec3 c=vec3(.027,.022,.018);",
    "  c=mix(c,vec3(.55,.24,.06),clamp(d*1.1,0.,1.));",
    "  c=mix(c,vec3(.93,.70,.36),clamp((d-.45)*1.4,0.,1.));",
    "  c=mix(c,vec3(1.,.93,.75),clamp((d-.9)*1.2,0.,1.)*.6);",
    "  c+=vec3(.9,.5,.15)*pow(length(q),3.)*.04*spot;",
    "  c*=smoothstep(1.25,.25,length(p*vec2(.8,1.)));",
    "  gl_FragColor=vec4(c,1.);",
    "}"
  ].join("\n");

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  var vs = compile(gl.VERTEX_SHADER, VERT);
  var fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;
  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(prog, "r");
  var uTime = gl.getUniformLocation(prog, "t");
  var uMouse = gl.getUniformLocation(prog, "m");

  // Render at reduced resolution: haze is soft, so this is invisible and cheap.
  var SCALE = 0.45;
  function resize() {
    var w = Math.max(1, Math.round(canvas.clientWidth * SCALE));
    var hgt = Math.max(1, Math.round(canvas.clientHeight * SCALE));
    if (canvas.width !== w || canvas.height !== hgt) {
      canvas.width = w;
      canvas.height = hgt;
      gl.viewport(0, 0, w, hgt);
    }
  }

  var mouse = { x: .5, y: .5 }, target = { x: .5, y: .5 };
  window.addEventListener("pointermove", function (e) {
    target.x = e.clientX / window.innerWidth;
    target.y = 1 - e.clientY / window.innerHeight;
  }, { passive: true });

  var visible = true, raf = 0, start = performance.now();
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && !raf && !reduceMotion) raf = requestAnimationFrame(frame);
    }).observe(canvas);
  }

  function draw(now) {
    resize();
    mouse.x += (target.x - mouse.x) * .04;
    mouse.y += (target.y - mouse.y) * .04;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, (now - start) / 1000 + 20);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function frame(now) {
    raf = 0;
    if (!visible || document.hidden) return;
    draw(now);
    raf = requestAnimationFrame(frame);
  }
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && visible && !raf && !reduceMotion) raf = requestAnimationFrame(frame);
  });
  window.addEventListener("resize", function () { if (reduceMotion) draw(performance.now()); });

  draw(performance.now());
  canvas.classList.add("is-ready");
  if (!reduceMotion) raf = requestAnimationFrame(frame);
})();
