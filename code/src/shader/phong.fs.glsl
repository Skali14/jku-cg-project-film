/**
 * a phong shader implementation
 * Created by Samuel Gratzl on 29.02.2016.
 */
precision mediump float;

/**
 * definition of a material structure containing common properties
 */
struct Material {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
	vec4 emission;
	float shininess;
};

/**
 * definition of the light properties related to material properties
 */
struct Light {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
};

struct SpotLight {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;

	vec3 direction;
	float cutOff;
};


uniform Material u_material;
uniform Light u_light1;
uniform Light u_light2;
uniform Light u_light3;
uniform Light u_light4;
uniform SpotLight u_spotlight;


//varying vectors for light computation
varying vec3 v_normalVec;
varying vec3 v_eyeVec;
varying vec3 v_light1Vec;
varying vec3 v_light2Vec;
varying vec3 v_light3Vec;
varying vec3 v_light4Vec;
varying vec3 v_spotlightVec;


vec4 calculateSimplePointLight(Light light, Material material, vec3 lightVec, vec3 normalVec, vec3 eyeVec) {
	// You can find all built-in functions (min, max, clamp, reflect, normalize, etc.) 
	// and variables (gl_FragCoord, gl_Position) in the OpenGL Shading Language Specification: 
	// https://www.khronos.org/registry/OpenGL/specs/gl/GLSLangSpec.4.60.html#built-in-functions
	lightVec = normalize(lightVec);
	normalVec = normalize(normalVec);
	eyeVec = normalize(eyeVec);

  // implement phong shader
	//compute diffuse term
	float diffuse = max(dot(normalVec,lightVec),0.0);
	//compute specular term
	vec3 reflectVec = reflect(-lightVec,normalVec);
	float spec = pow( max( dot(reflectVec, eyeVec), 0.0) , material.shininess);


	vec4 c_amb  = clamp(light.ambient * material.ambient, 0.0, 1.0);
	vec4 c_diff = clamp(diffuse * light.diffuse * material.diffuse, 0.0, 1.0);
	vec4 c_spec = clamp(spec * light.specular * material.specular, 0.0, 1.0);
	vec4 c_em   = material.emission;

	return c_amb + c_diff + c_spec + c_em;
}

vec4 calculateSimpleSpotLight(SpotLight spotlight, Material material, vec3 spotlightVec, vec3 normalVec, vec3 eyeVec) {

	spotlightVec = normalize(spotlightVec);
	normalVec = normalize(normalVec);
	eyeVec = normalize(eyeVec);

	float dotFromDirection = dot(spotlightVec, -normalize(spotlight.direction));

	if(dotFromDirection >= spotlight.cutOff) {

		float diffuse = max(dot(normalVec,spotlightVec),0.0);

		vec3 reflectVec = reflect(-spotlightVec,normalVec);
		float spec = pow( max( dot(reflectVec, eyeVec), 0.0) , material.shininess);

		vec4 c_amb  = clamp(spotlight.ambient * material.ambient, 0.0, 1.0);
		vec4 c_diff = clamp(diffuse * spotlight.diffuse * material.diffuse, 0.0, 1.0);
		vec4 c_spec = clamp(spec * spotlight.specular * material.specular, 0.0, 1.0);
		vec4 c_em   = material.emission;

		return (c_amb + c_diff + c_spec + c_em) * (1.0 -(1.0 -dotFromDirection) * 1.0/(1.0 - spotlight.cutOff));
	} else {
		return vec4(0, 0, 0, material.emission);
	}
}

void main() {

	gl_FragColor =
		calculateSimplePointLight(u_light1, u_material, v_light1Vec, v_normalVec, v_eyeVec)
	  + calculateSimplePointLight(u_light2, u_material, v_light2Vec, v_normalVec, v_eyeVec)
	  + calculateSimplePointLight(u_light3, u_material, v_light3Vec, v_normalVec, v_eyeVec)
	  + calculateSimplePointLight(u_light4, u_material, v_light4Vec, v_normalVec, v_eyeVec)
	  + calculateSimpleSpotLight(u_spotlight, u_material, v_spotlightVec, v_normalVec, v_eyeVec);

}
