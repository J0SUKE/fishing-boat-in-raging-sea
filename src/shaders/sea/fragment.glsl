uniform vec3 uColorA;
uniform vec3 uColorB;
varying vec3 vNormal;
varying float vElevation;
uniform float uWavesStrengh;
varying vec3 vPosition;

void main()
{        
    
    float elevation = 0.;
    if(abs(vPosition.x)<2.5 && abs(vPosition.z)<2.5)
    {
        elevation = smoothstep(-uWavesStrengh,uWavesStrengh,vElevation);
    }
    else{
        elevation = smoothstep(-0.5,uWavesStrengh,vPosition.y);
    }

    if(vPosition.y==-0.5)
    {
        elevation=0.;
    }

    vec3 mixColor = mix(uColorA,uColorB,elevation);
    
    float alpha = smoothstep(uWavesStrengh,-0.5,vPosition.y);
    alpha = mix(0.8,0.96,alpha);

    gl_FragColor = vec4(mixColor, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}