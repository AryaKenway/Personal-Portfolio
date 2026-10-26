import{i as e,s as t,u as n}from"./home-CsLDWyQ-.js";import{c as r,d as i,f as a,g as o,h as s,i as c,m as l,n as u,s as d,t as f,u as p,v as m,w as h,y as g}from"./react-three-fiber.esm-BzlVkPVN.js";import{t as _}from"./Stars-Dn8MjCKG.js";var v=n(t(),1),y=e(),b=100,x=85,S=58,C=`
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,w=`
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
`,T=`
varying vec3 vDirection;

void main() {
    vDirection = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,E=`
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
`,D=[[`#4a5fc1`,`#2a2f6e`],[`#8a4fc4`,`#3a2a6e`],[`#c2457f`,`#4a2350`],[`#b8342c`,`#4d1f2a`],[`#e0702e`,`#5a2a1a`],[`#d8a03a`,`#4a3a1c`],[`#2fa39a`,`#183f4a`]].map(([e,t])=>[new r(e),new r(t)]),O=30;function k(e,t,n){let r=e/O%D.length,a=Math.floor(r),[o,s]=D[a],[c,l]=D[(a+1)%D.length],u=i.smootherstep(r-a,0,1);t.lerpColors(o,c,u),n.lerpColors(s,l,u)}function A(e,t){let n=new h(t,t/2,{depthBuffer:!1,generateMipmaps:!1,minFilter:p,magFilter:p,wrapS:o,wrapT:d}),r=new a(new s(2,2),new g({vertexShader:C,fragmentShader:w,depthTest:!1,depthWrite:!1})),i=new m;i.add(r);let c=e.getRenderTarget();return e.setRenderTarget(n),e.render(i,new l(-1,1,1,-1,0,1)),e.setRenderTarget(c),r.geometry.dispose(),r.material.dispose(),n}function j({spin:e,maskWidth:t}){let n=c(e=>e.gl),i=c(e=>e.invalidate),a=(0,v.useMemo)(()=>{let e=new r,t=new r;return k(Date.now()/1e3,e,t),{uMasks:{value:null},uGlow:{value:e},uHaze:{value:t}}},[]);return(0,v.useEffect)(()=>{let e=A(n,t);return a.uMasks.value=e.texture,i(),()=>{a.uMasks.value=null,e.dispose()}},[n,t,a,i]),u(()=>{e&&k(Date.now()/1e3,a.uGlow.value,a.uHaze.value)}),(0,y.jsxs)(`mesh`,{children:[(0,y.jsx)(`sphereGeometry`,{args:[b,48,24]}),(0,y.jsx)(`shaderMaterial`,{vertexShader:T,fragmentShader:E,uniforms:a,side:1,depthWrite:!1})]})}function M({open:e,reducedMotion:t}){let n=(0,v.useRef)({x:0,y:0}),r=(0,v.useRef)(null),a=(0,v.useRef)(0);return(0,v.useEffect)(()=>{let e=()=>{a.current=document.documentElement.scrollHeight-window.innerHeight};e();let t=new ResizeObserver(e);return t.observe(document.body),window.addEventListener(`resize`,e),()=>{t.disconnect(),window.removeEventListener(`resize`,e)}},[]),(0,v.useEffect)(()=>{if(t)return;let e=e=>{n.current.x=e.clientX/window.innerWidth*2-1,n.current.y=e.clientY/window.innerHeight*2-1};return window.addEventListener(`pointermove`,e,{passive:!0}),()=>window.removeEventListener(`pointermove`,e)},[t]),u(({camera:o,clock:s},c)=>{let l=a.current>0?i.clamp(window.scrollY/a.current,0,1):0,u=+!t,d=-.55+l*1.6*u+s.elapsedTime*.006*u-n.current.x*.12,f=.32-l*.45*u-n.current.y*.08;r.current||={yaw:d,pitch:f},r.current.yaw=i.damp(r.current.yaw,d,4,c),r.current.pitch=i.damp(r.current.pitch,f,4,c),o.rotation.set(r.current.pitch,r.current.yaw,0,`YXZ`);let p=e?S:x;o.fov=t?p:i.damp(o.fov,p,1.6,c),o.updateProjectionMatrix()}),null}function N({open:e,reducedMotion:t}){let n=typeof window<`u`&&window.matchMedia(`(max-width: 47.99rem)`).matches;return(0,y.jsxs)(f,{camera:{fov:e||t?S:x,position:[0,0,0],near:.1,far:400},dpr:[1,1.25],gl:{antialias:!1,powerPreference:`low-power`},frameloop:t?`demand`:`always`,children:[(0,y.jsx)(j,{spin:!t,maskWidth:n?1024:2048}),(0,y.jsx)(_,{radius:50,depth:35,count:n?1200:2500,factor:3.6,saturation:0,fade:!0,speed:t?0:.5}),(0,y.jsx)(M,{open:e,reducedMotion:t})]})}export{N as NightSky};