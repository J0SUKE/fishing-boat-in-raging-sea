varying vec3 vNormal;
uniform float uTime;
varying vec2 vElevation;

uniform float uWavesStrengh;
uniform vec2 uWavesFreq;

#include ../utils/waves.glsl;

void main()
{
    vec4 modelNormal = modelMatrix*vec4(normal,0.);
    
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    //compute normals
    float shift = 0.01;
    vec3 a = modelPosition.xyz;
    a.x += shift;
    
    vec3 b = modelPosition.xyz;
    b.z -= shift;
    


    a.y += waves(a,uWavesStrengh,uWavesFreq).x;
    b.y += waves(b,uWavesStrengh,uWavesFreq).x;
    vec2 yWaves = waves(modelPosition.xyz,uWavesStrengh,uWavesFreq);
    
    modelPosition.y += yWaves.x;

    vec3 toA = normalize(a - modelPosition.xyz);
    vec3 toB = normalize(b - modelPosition.xyz);


    vNormal=cross(toA,toB);
    vElevation = yWaves;
        
    
    vec4 modelPos = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPos;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;            
}