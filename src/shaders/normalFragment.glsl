varying vec3 vNormal;

void main()
{
    vec3 normal = normalize(vNormal);
    
    gl_FragColor = vec4(normal,1.);
}