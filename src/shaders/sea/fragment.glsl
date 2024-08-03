uniform vec3 uColorA;
uniform vec3 uColorB;
varying vec3 vNormal;
varying float vElevation;
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
        elevation = smoothstep(-uWavesStrengh,uWavesStrengh,vElevation);

        foam = abs(perlinClassic3D(vec3(vPosition.xz*5.*(0.5),uTime*min(uWavesStrengh,0.3))));
        foam=1.-step(0.08,foam);
        foam*=smoothstep(0.3,0.,uWavesStrengh)*0.05;
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
    

    color.rgb+=foam;
    
    float alpha = smoothstep(uWavesStrengh,-0.5,vPosition.y);
    alpha = mix(0.8,0.96,alpha);

    gl_FragColor = vec4(color, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}