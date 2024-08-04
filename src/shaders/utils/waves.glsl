#include ./perlin-classic-3d.glsl

vec2 waves(vec3 position,float wavesStrengh,vec2 wavesFreq)
{
    float XbigWaves = sin((position.x+cos(position.z)*0.5)*wavesFreq.x + uTime);
    float ZbigWaves = sin((position.z+cos(position.x)*0.5)*wavesFreq.y + uTime);

    float elevation = wavesStrengh*XbigWaves*ZbigWaves;    

    float totalSmallWaves = 0.;

    for(float i=1.0;i<=2.;i++)
    {
        //freq ==> ampl <==        
        float smallWave = abs(perlinClassic3D(vec3(position.xz*3.*i,uTime*0.2))*wavesStrengh*0.5/i);
        totalSmallWaves+=smallWave;
        elevation-=smallWave;        
    }

    return vec2(elevation,totalSmallWaves);
}