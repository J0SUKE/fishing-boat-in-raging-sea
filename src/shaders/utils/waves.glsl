#include ./perlin-classic-3d.glsl

float waves(vec3 position,float wavesStrengh,vec2 wavesFreq)
{
    float XbigWaves = sin(position.x*wavesFreq.x + uTime);
    float ZbigWaves = sin(position.z*wavesFreq.y + uTime);

    float elevation = wavesStrengh*XbigWaves*ZbigWaves;    

    for(float i=1.0;i<=2.;i++)
    {
        //freq ==> ampl <==
        
        elevation-=abs(perlinClassic3D(vec3(position.xz*3.*i,uTime*0.2))*wavesStrengh*0.5/i);
    }

    return elevation;
}


// float waves(vec3 position,vec2 wavesStrengh,vec2 wavesFreq)
// {
//     float xWaves = sin(-position.x*wavesFreq.x - uTime)*wavesStrengh.x;
//     float zWaves = sin(-position.z*wavesFreq.y - uTime)*wavesStrengh.y;
    
//     return xWaves;
 
// }