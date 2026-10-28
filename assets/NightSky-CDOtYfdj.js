import{i as e,s as t,u as n}from"./home-B1p9LnN1.js";import{C as r,c as i,d as a,f as o,g as s,h as c,i as l,m as u,n as d,s as f,t as p,u as m,v as h,w as g,x as _,y as v}from"./react-three-fiber.esm-CFJcBAYs.js";var y=parseInt(`186`.replace(/\D+/g,``)),b=n(t()),x=class extends v{constructor(){super({uniforms:{time:{value:0},fade:{value:1}},vertexShader:`
      uniform float time;
      attribute float size;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 0.5);
        gl_PointSize = size * (30.0 / -mvPosition.z) * (3.0 + sin(time + 100.0));
        gl_Position = projectionMatrix * mvPosition;
      }`,fragmentShader:`
      uniform sampler2D pointTexture;
      uniform float fade;
      varying vec3 vColor;
      void main() {
        float opacity = 1.0;
        if (fade == 1.0) {
          float d = distance(gl_PointCoord, vec2(0.5, 0.5));
          opacity = 1.0 / (1.0 + exp(16.0 * (d - 0.25)));
        }
        gl_FragColor = vec4(vColor, opacity);

        #include <tonemapping_fragment>
	      #include <${y>=154?`colorspace_fragment`:`encodings_fragment`}>
      }`})}},S=e=>new r().setFromSpherical(new _(e,Math.acos(1-Math.random()*2),Math.random()*2*Math.PI)),C=b.forwardRef(({radius:e=100,depth:t=50,count:n=5e3,saturation:r=0,factor:a=4,fade:o=!1,speed:s=1},c)=>{let l=b.useRef(null),[u,f,p]=b.useMemo(()=>{let o=[],s=[],c=Array.from({length:n},()=>(.5+.5*Math.random())*a),l=new i,u=e+t,d=t/n;for(let e=0;e<n;e++)u-=d*Math.random(),o.push(...S(u).toArray()),l.setHSL(e/n,r,.9),s.push(l.r,l.g,l.b);return[new Float32Array(o),new Float32Array(s),new Float32Array(c)]},[n,t,a,e,r]);d(e=>l.current&&(l.current.uniforms.time.value=e.clock.elapsedTime*s));let[m]=b.useState(()=>new x);return b.createElement(`points`,{ref:c},b.createElement(`bufferGeometry`,null,b.createElement(`bufferAttribute`,{attach:`attributes-position`,args:[u,3]}),b.createElement(`bufferAttribute`,{attach:`attributes-color`,args:[f,3]}),b.createElement(`bufferAttribute`,{attach:`attributes-size`,args:[p,1]})),b.createElement(`primitive`,{ref:l,object:m,attach:`material`,blending:2,"uniforms-fade-value":o,depthWrite:!1,transparent:!0,vertexColors:!0}))}),w=e(),T=100,E=85,D=58,O=`
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,k=`
varying vec2 vUv;
const float PI = 3.14159265;

float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
        mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
        f.z
    );
}

float fbm(vec3 p) {
    float sum = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++) {
        sum += amp * noise(p);
        p *= 2.03;
        amp *= 0.5;
    }
    return sum;
}

void main() {
    // The texel's direction on the sphere. Noise is sampled by direction, so it has no seam.
    float lon = (vUv.x - 0.5) * 2.0 * PI;
    float lat = (vUv.y - 0.5) * PI;
    vec3 dir = vec3(cos(lat) * sin(lon), sin(lat), cos(lat) * cos(lon));

    // A tilted band of dust across the sky, like the Milky Way.
    float band = exp(-pow(dir.y * 2.4 + sin(dir.x * 2.1 + dir.z) * 0.45, 2.0));
    float dust = fbm(dir * 2.4);
    float glow = smoothstep(0.38, 0.85, dust) * band;
    float haze = smoothstep(0.42, 0.9, fbm(dir * 3.6 + 7.0)) * band;
    gl_FragColor = vec4(glow, haze, dust, 1.0);
}
`,A=`
varying vec3 vDirection;

void main() {
    vDirection = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,j=`
uniform sampler2D uMasks;
uniform vec3 uGlow;
uniform vec3 uHaze;
varying vec3 vDirection;
const float PI = 3.14159265;

void main() {
    vec3 dir = normalize(vDirection);
    // The inverse of the bake's mapping. Without mipmaps, the wrap at u = 0/1 shows no seam.
    vec2 uv = vec2(atan(dir.x, dir.z) / (2.0 * PI) + 0.5, asin(clamp(dir.y, -1.0, 1.0)) / PI + 0.5);
    vec3 masks = texture2D(uMasks, uv).rgb;

    // Near-black, darker overhead, with a faint wash of the current colour.
    vec3 color = mix(vec3(0.06, 0.055, 0.05), vec3(0.03, 0.03, 0.04), smoothstep(-0.2, 0.9, dir.y));
    color += uHaze * 0.05;
    color += masks.r * mix(uGlow, mix(uGlow, vec3(1.0), 0.35), masks.b) * 0.55;
    color += masks.g * uHaze * 0.5;
    gl_FragColor = vec4(color, 1.0);
}
`,M=[[`#4a5fc1`,`#2a2f6e`],[`#8a4fc4`,`#3a2a6e`],[`#c2457f`,`#4a2350`],[`#b8342c`,`#4d1f2a`],[`#e0702e`,`#5a2a1a`],[`#d8a03a`,`#4a3a1c`],[`#2fa39a`,`#183f4a`]].map(([e,t])=>[new i(e),new i(t)]),N=30;function P(e,t,n){let r=e/N%M.length,i=Math.floor(r),[o,s]=M[i],[c,l]=M[(i+1)%M.length],u=a.smootherstep(r-i,0,1);t.lerpColors(o,c,u),n.lerpColors(s,l,u)}function F(e,t){let n=new g(t,t/2,{depthBuffer:!1,generateMipmaps:!1,minFilter:m,magFilter:m,wrapS:s,wrapT:f}),r=new o(new c(2,2),new v({vertexShader:O,fragmentShader:k,depthTest:!1,depthWrite:!1})),i=new h;i.add(r);let a=e.getRenderTarget();return e.setRenderTarget(n),e.render(i,new u(-1,1,1,-1,0,1)),e.setRenderTarget(a),r.geometry.dispose(),r.material.dispose(),n}function I({spin:e,maskWidth:t}){let n=l(e=>e.gl),r=l(e=>e.invalidate),a=(0,b.useMemo)(()=>{let e=new i,t=new i;return P(Date.now()/1e3,e,t),{uMasks:{value:null},uGlow:{value:e},uHaze:{value:t}}},[]);return(0,b.useEffect)(()=>{let e=F(n,t);return a.uMasks.value=e.texture,r(),()=>{a.uMasks.value=null,e.dispose()}},[n,t,a,r]),d(()=>{e&&P(Date.now()/1e3,a.uGlow.value,a.uHaze.value)}),(0,w.jsxs)(`mesh`,{children:[(0,w.jsx)(`sphereGeometry`,{args:[T,48,24]}),(0,w.jsx)(`shaderMaterial`,{vertexShader:A,fragmentShader:j,uniforms:a,side:1,depthWrite:!1})]})}function L({open:e,reducedMotion:t}){let n=(0,b.useRef)({x:0,y:0}),r=(0,b.useRef)(null),i=(0,b.useRef)(0);return(0,b.useEffect)(()=>{let e=()=>{i.current=document.documentElement.scrollHeight-window.innerHeight};e();let t=new ResizeObserver(e);return t.observe(document.body),window.addEventListener(`resize`,e),()=>{t.disconnect(),window.removeEventListener(`resize`,e)}},[]),(0,b.useEffect)(()=>{if(t)return;let e=e=>{n.current.x=e.clientX/window.innerWidth*2-1,n.current.y=e.clientY/window.innerHeight*2-1};return window.addEventListener(`pointermove`,e,{passive:!0}),()=>window.removeEventListener(`pointermove`,e)},[t]),d(({camera:o,clock:s},c)=>{let l=i.current>0?a.clamp(window.scrollY/i.current,0,1):0,u=+!t,d=-.55+l*1.6*u+s.elapsedTime*.006*u-n.current.x*.12,f=.32-l*.45*u-n.current.y*.08;r.current||={yaw:d,pitch:f},r.current.yaw=a.damp(r.current.yaw,d,4,c),r.current.pitch=a.damp(r.current.pitch,f,4,c),o.rotation.set(r.current.pitch,r.current.yaw,0,`YXZ`);let p=e?D:E;o.fov=t?p:a.damp(o.fov,p,1.6,c),o.updateProjectionMatrix()}),null}function R({open:e,reducedMotion:t}){let n=typeof window<`u`&&window.matchMedia(`(max-width: 47.99rem)`).matches;return(0,w.jsxs)(p,{camera:{fov:e||t?D:E,position:[0,0,0],near:.1,far:400},dpr:[1,1.25],gl:{antialias:!1,powerPreference:`low-power`},frameloop:t?`demand`:`always`,children:[(0,w.jsx)(I,{spin:!t,maskWidth:n?1024:2048}),(0,w.jsx)(C,{radius:50,depth:35,count:n?1200:2500,factor:3.6,saturation:0,fade:!0,speed:t?0:.5}),(0,w.jsx)(L,{open:e,reducedMotion:t})]})}export{R as NightSky};