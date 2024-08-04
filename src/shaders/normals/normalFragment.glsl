varying vec3 vNormal;
varying vec2 vElevation;

void main()
{
    vec3 normal = normalize(vNormal)*0.5 + 0.5;//!! rember to reapply this transformation when retrieving the normals texture
    
    gl_FragColor = vec4(normal,vElevation.x);
}