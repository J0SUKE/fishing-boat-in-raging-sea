uniform vec3 uColorA;
uniform vec3 uColorB;
varying vec3 vNormal;
varying float vElevation;

void main()
{        
    float elevation = smoothstep(-1.,1.,vElevation);

    vec3 mixColor = mix(uColorA,uColorB,elevation);

    gl_FragColor = vec4(mixColor, 1.0);
}