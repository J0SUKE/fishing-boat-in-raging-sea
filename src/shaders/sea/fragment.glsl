uniform vec3 uColorA;
uniform vec3 uColorB;
varying vec2 vElevation;
uniform float uWavesStrengh;
uniform float uTime;
varying vec3 vPosition;

//#include ../utils/simplex-noise-4d.glsl
#include ../utils/perlin-classic-3d.glsl

void main()
{        
    
    float elevation = 0.;
    vec3 color = vec3(0.);
    float foam = 0.;


    if(abs(vPosition.x)<2.5 && abs(vPosition.z)<2.5)
    {
        elevation = smoothstep(-uWavesStrengh,uWavesStrengh,vElevation.x);
        foam+=smoothstep(0.5,0.8,elevation)*0.1;

        float smallWavesElevation = smoothstep(0.,uWavesStrengh*0.75,vElevation.y);
        foam+=(1.-step(0.02,smallWavesElevation));
        foam*=0.2;
    }
    else{
        elevation = smoothstep(-0.5,uWavesStrengh,vPosition.y);
    }

    if(vPosition.y==-0.5)
    {
        elevation=0.;
        foam=0.;
    }
    

    vec3 mixColor = mix(uColorA,uColorB,elevation);
    color+=mixColor;
    
    color+=foam;
    
    float alpha = smoothstep(uWavesStrengh,-0.5,vPosition.y);
    alpha = mix(0.8,0.96,alpha);

    gl_FragColor = vec4(color, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}