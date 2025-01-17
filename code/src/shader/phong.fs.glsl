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
uniform SpotLight u_rotatingSpotlight;

uniform bool u_enableObjectTexture;
uniform sampler2D u_tex;
uniform bool u_useReflection;
uniform bool u_applyLights;
uniform samplerCube u_texCube;

//varying vectors for light computation
varying vec2 v_texCoord;

varying vec3 v_normalVec;
varying vec3 v_eyeVec;
varying vec3 v_light1Vec;
varying vec3 v_light2Vec;
varying vec3 v_light3Vec;
varying vec3 v_light4Vec;
varying vec3 v_spotlightVec;
varying vec3 v_rotatingSpotlightVec;
varying vec3 v_cameraRayVec;



vec4 calculateSimplePointLight(Light light, Material material, vec3 lightVec, vec3 normalVec, vec3 eyeVec, vec4 textureColor) {
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

	if(u_enableObjectTexture) {
		material.diffuse = textureColor;
		material.ambient = textureColor;
	}


	vec4 c_amb  = clamp(light.ambient * material.ambient, 0.0, 1.0);
	vec4 c_diff = clamp(diffuse * light.diffuse * material.diffuse, 0.0, 1.0);
	vec4 c_spec = clamp(spec * light.specular * material.specular, 0.0, 1.0);
	vec4 c_em   = material.emission;

	return c_amb + c_diff + c_spec + c_em;
}

vec4 calculateSimpleSpotLight(SpotLight spotlight, Material material, vec3 spotlightVec, vec3 normalVec, vec3 eyeVec, vec4 textureColor) {

	spotlightVec = normalize(spotlightVec);
	normalVec = normalize(normalVec);
	eyeVec = normalize(eyeVec);

	float dotFromDirection = dot(spotlightVec, -normalize(spotlight.direction));

	//only if angle between light source to given point is less than cutOff angle, define spotlight, else return empty vec
	if(dotFromDirection >= spotlight.cutOff) {

		float diffuse = max(dot(normalVec,spotlightVec),0.0);

		vec3 reflectVec = reflect(-spotlightVec,normalVec);
		float spec = pow( max( dot(reflectVec, eyeVec), 0.0) , material.shininess);

		if(u_enableObjectTexture) {
			material.diffuse = textureColor;
			material.ambient = textureColor;
		}

		vec4 c_amb  = clamp(spotlight.ambient * material.ambient, 0.0, 1.0);
		vec4 c_diff = clamp(diffuse * spotlight.diffuse * material.diffuse, 0.0, 1.0);
		vec4 c_spec = clamp(spec * spotlight.specular * material.specular, 0.0, 1.0);
		vec4 c_em   = material.emission;

		return (c_amb + c_diff + c_spec + c_em) * (1.0 -(1.0 -dotFromDirection) * 1.0/(1.0 - spotlight.cutOff));
	} else {
		return vec4(0, 0, 0, 0);
	}
}

void main() {
	vec4 textureColor = vec4(0,0,0,1);

	if(u_enableObjectTexture) {
		textureColor = texture2D(u_tex,v_texCoord);
	}

	vec3 normalVec = normalize(v_normalVec);
	vec3 cameraRayVec = normalize(v_cameraRayVec);

	vec3 texCoords;
	if(u_useReflection) {
		//compute reflected camera ray (assign to texCoords)
		texCoords = reflect(cameraRayVec, v_normalVec);
	} else {
		texCoords = cameraRayVec;
	}

	if(u_applyLights) {
		gl_FragColor =
		calculateSimplePointLight(u_light1, u_material, v_light1Vec, v_normalVec, v_eyeVec, textureColor)
		+ calculateSimplePointLight(u_light2, u_material, v_light2Vec, v_normalVec, v_eyeVec, textureColor)
		+ calculateSimplePointLight(u_light3, u_material, v_light3Vec, v_normalVec, v_eyeVec, textureColor)
		+ calculateSimplePointLight(u_light4, u_material, v_light4Vec, v_normalVec, v_eyeVec, textureColor)
		+ calculateSimpleSpotLight(u_spotlight, u_material, v_spotlightVec, v_normalVec, v_eyeVec, textureColor)
		+ calculateSimpleSpotLight(u_rotatingSpotlight, u_material, v_rotatingSpotlightVec, v_normalVec, v_eyeVec, textureColor)
		+ textureCube(u_texCube, texCoords);
	} else {
		gl_FragColor = textureCube(u_texCube, texCoords);
	}

}
