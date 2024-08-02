uniform vec3 uColorA;
uniform vec3 uColorB;
varying vec3 vNormal;
varying float vElevation;
uniform float uWavesStrengh;

void main()
{        
    float elevation = smoothstep(-uWavesStrengh,uWavesStrengh,vElevation);

    vec3 mixColor = mix(uColorA,uColorB,elevation);


    gl_FragColor = vec4(mixColor, 1.0);
}