varying vec3 vNormal;
uniform float uTime;
varying float vElevation;

float elevation(vec3 position)
{
    return sin(-position.x*3. - uTime)*0.3;    
}

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
    

    a.y += elevation(a);
    b.y += elevation(b);
    float yElevation = elevation(modelPosition.xyz);
    
    modelPosition.y += yElevation;    

    vec3 toA = normalize(a - modelPosition.xyz);
    vec3 toB = normalize(b - modelPosition.xyz);


    vNormal=cross(toA,toB);
    vElevation = yElevation;
        
    
    vec4 modelPos = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPos;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;            
}