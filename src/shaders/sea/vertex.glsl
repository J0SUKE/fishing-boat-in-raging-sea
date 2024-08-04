varying vec3 vNormal;
uniform float uTime;
varying vec2 vElevation;
varying vec3 vPosition;

uniform float uWavesStrengh;
uniform vec2 uWavesFreq;

#include ../utils/waves.glsl;



void main()
{
    
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    if(position.y>-0.5)
    {        
        vec2 yWaves = waves(modelPosition.xyz,uWavesStrengh,uWavesFreq);
        
        modelPosition.y += yWaves.x;    

        vElevation = yWaves;   
    }
    else{
        vElevation.x=0.;
    } 
        
    
    vPosition=position;
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;            
}