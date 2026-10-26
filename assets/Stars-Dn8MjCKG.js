import{s as e,u as t}from"./home-CsLDWyQ-.js";import{C as n,c as r,n as i,x as a,y as o}from"./react-three-fiber.esm-BzlVkPVN.js";var s=t(e()),c=parseInt(`186`.replace(/\D+/g,``)),l=class extends o{constructor(){super({uniforms:{time:{value:0},fade:{value:1}},vertexShader:`
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
	      #include <${c>=154?`colorspace_fragment`:`encodings_fragment`}>
      }`})}},u=e=>new n().setFromSpherical(new a(e,Math.acos(1-Math.random()*2),Math.random()*2*Math.PI)),d=s.forwardRef(({radius:e=100,depth:t=50,count:n=5e3,saturation:a=0,factor:o=4,fade:c=!1,speed:d=1},f)=>{let p=s.useRef(null),[m,h,g]=s.useMemo(()=>{let i=[],s=[],c=Array.from({length:n},()=>(.5+.5*Math.random())*o),l=new r,d=e+t,f=t/n;for(let e=0;e<n;e++)d-=f*Math.random(),i.push(...u(d).toArray()),l.setHSL(e/n,a,.9),s.push(l.r,l.g,l.b);return[new Float32Array(i),new Float32Array(s),new Float32Array(c)]},[n,t,o,e,a]);i(e=>p.current&&(p.current.uniforms.time.value=e.clock.elapsedTime*d));let[_]=s.useState(()=>new l);return s.createElement(`points`,{ref:f},s.createElement(`bufferGeometry`,null,s.createElement(`bufferAttribute`,{attach:`attributes-position`,args:[m,3]}),s.createElement(`bufferAttribute`,{attach:`attributes-color`,args:[h,3]}),s.createElement(`bufferAttribute`,{attach:`attributes-size`,args:[g,1]})),s.createElement(`primitive`,{ref:p,object:_,attach:`material`,blending:2,"uniforms-fade-value":c,depthWrite:!1,transparent:!0,vertexColors:!0}))});export{d as t};