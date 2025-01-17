//the OpenGL context
var gl = null,
    program = null;


//Camera
var camera = null;
var cameraPos = vec3.create();
var cameraCenter = vec3.create();
var cameraStartPos = null;
var envcubetexture;
//var cameraAnimation = null;

// scenegraph root node
var root = null;

// time in last render step
var previousTime = 0;

let totalArmTransformNode;
let arm4RotationTransformation;
let gripperRotationTransformation;
let arduinoTransformation;
let rbPiTransformation;
let gripper;
let rbPi;
let rotatingSpotlightTransformationNode;



let arm1Pos = vec3.fromValues(-0.010286, 5.52644, 0);
let arm2Pos = vec3.fromValues(-3.42716, 5.5264, 0);
let arm3Pos = vec3.fromValues(-3.52398, 8.8901, 0);
let arm4Pos = vec3.fromValues(-0.116274, 8.8901, 0);
let arm5Pos = vec3.fromValues(0.745563, 11.4626, 0);
let arm6Pos = vec3.fromValues(3.61406, 14.4785, 0);
let arm7Pos = vec3.fromValues(7.62936, 10.9442, 0);
let gripperPos = vec3.fromValues(9.60342, 6.50871, 0);

//load the shader resources using a utility function
loadResources({
    vs: './src/shader/phong.vs.glsl',
    fs: './src/shader/phong.fs.glsl',
    vs_single: './src/shader/single.vs.glsl',
    fs_single: './src/shader/single.fs.glsl',
    base: './src/models/base.obj',
    arm1: './src/models/Arm1.obj',
    arm2: './src/models/Arm2.obj',
    arm3: './src/models/Arm3.obj',
    arm4: './src/models/Arm4.obj',
    arm5: './src/models/Arm5.obj',
    arm6: './src/models/Arm6.obj',
    arm7: './src/models/Arm7.obj',
    gripper: './src/models/Gripper.obj',
    table: './src/models/assembly_table.obj',
    rb_pi: './src/models/rb_pi.obj',
    arduino: './src/models/arduino.obj',
    conveyor: './src/models/conveyor.obj',
    box: './src/models/box1.obj',
    circuit_board: './src/models/circuit_board.obj',
    rail: './src/models/rail.obj',
    wall_ceiling: './src/models/wall_ceiling.obj',
    ceiling_light_casing: './src/models/ceiling_light_casing.obj',
    ceiling_light_light: './src/models/ceiling_light_light.obj',
    spotlight_stand: './src/models/spotlight_stand.obj',
    spotlight_light: './src/models/spotlight_light.obj',
    spotlight_lightbulb: './src/models/spotlight_lightbulb.obj',
    steel: './src/models/steel.jpg',
    white_plastic: './src/models/white_plastic.jpg',
    red_aluminum: './src/models/red_aluminum.jpg',
    env_pos_x: './src/models/skybox/px.png',
    env_neg_x: './src/models/skybox/nx.png',
    env_pos_y: './src/models/skybox/py.png',
    env_neg_y: './src/models/skybox/ny.png',
    env_pos_z: './src/models/skybox/pz.png',
    env_neg_z: './src/models/skybox/nz.png',
}).then(function (resources /*an object containing our keys with the loaded resources*/) {
    init(resources);

    render(0);
});

/**
 * initializes OpenGL context, compile shader, and load buffers
 */
function init(resources) {
    //create a GL context
    gl = createContext();

    initCubeMap(resources);

    //setup camera
    cameraStartPos = vec3.fromValues(0, 2.3, 11.5);
    camera = new UserControlledCamera(gl.canvas, cameraStartPos);
    camera.control.lookingDir.x = 180;

    //set up an animation for the camera, moving it into position
    initCameraAnimations();
    
    root = createSceneGraph(gl, resources);
}


function createSceneGraph(gl, resources) {
    //create scenegraph
    const root = new ShaderSGNode(createProgram(gl, resources.vs, resources.fs))

    //create skybox
    let skybox = new EnvironmentSGNode(envcubetexture, 4, false,
        new RenderSGNode(makeSphere(50)));
    root.append(skybox);

    //create 4 light nodes for the ceiling lights
    let light1 = createCeilingLightLightNode();
    light1.uniform = 'u_light1';
    light1.position = [-3, 5.7, -3];
    root.append(light1);

    let light2 = createCeilingLightLightNode();
    light2.uniform = 'u_light2';
    light2.position = [3, 5.7, -3];
    root.append(light2);

    let light3 = createCeilingLightLightNode();
    light3.uniform = 'u_light3';
    light3.position = [-3, 5.7, 3];
    root.append(light3);

    let light4 = createCeilingLightLightNode();
    light4.uniform = 'u_light4';
    light4.position = [3, 5.7, 3];
    root.append(light4);

    //create spotlight node
    let spotLight = new SpotLightNode();
    spotLight.position = [-1.45, 3.2, -4.96];
    spotLight.ambient = [.75, .75, .75, 1];
    spotLight.diffuse = [1, 1, 1, 1];
    spotLight.specular = [1, 1, 1, 1];
    spotLight.cutOff = Math.cos(glm.deg2rad(9));
    spotLight.direction = [1.45, -4.4, 4.9];
    root.append(spotLight);

    rotatingSpotLight = new SpotLightNode();
    rotatingSpotLight.position = [0, 3.2, -2.6];
    rotatingSpotLight.ambient = [.75, .75, .75, 1];
    rotatingSpotLight.diffuse = [1, 1, 1, 1];
    rotatingSpotLight.specular = [1, 1, 1, 1];
    rotatingSpotLight.cutOff = Math.cos(glm.deg2rad(15));
    rotatingSpotLight.direction = [0, -1, 0];
    rotatingSpotLight.uniform = "u_rotatingSpotlight";
    rotatingSpotlightTransformationNode = new TransformationSGNode(glm.translate(0, 0, 0), [rotatingSpotLight]);
    root.append(rotatingSpotlightTransformationNode);

    // create floor
    let floor = new MaterialSGNode([
        new RenderSGNode(makeRect(2, 2))
    ]);
    
    //dark
    floor.ambient = [0.2, 0.2, 0.2, 1];
    floor.diffuse = [0.1, 0.1, 0.1, 1];
    floor.specular = [0.5, 0.5, 0.5, 1];
    floor.shininess = 3;
    // add floor to scenegraph
    root.append(new TransformationSGNode(glm.transform({translate: [0, 0, 0], rotateX: -90, scale: 6}), [
        floor
    ]));
    
    //whole robotic arm transformation node
    totalArmTransformNode = new TransformationSGNode(glm.transform({
        translate: [0, 0, 4.5],
        rotateY: 180,
        scale: 0.30
    }));
    root.append(totalArmTransformNode);

    //create base
    let base = new MaterialSGNode(new CustomTextureNode(resources.steel, [
        new RenderSGNode(resources.base)
    ]));

    base.ambient = [0.05375, 0.05, 0.06625, 0.82];
    base.diffuse = [0.18275, 0.17, 0.22525, 0.82];
    base.specular = [0.332741, 0.328634, 0.346435, 0.82];
    base.shininess = 38.4;
    
    totalArmTransformNode.append(new TransformationSGNode(mat4.create(),[base]));

    //create arm1
    let arm1 = createArm1To3MaterialNode(new CustomTextureNode(resources.steel, [new RenderSGNode(resources.arm1)]));
    
    //add arm1 to scene graph
    totalArmTransformNode.append(new TransformationSGNode(glm.translate(arm1Pos[0], arm1Pos[1], arm1Pos[2]), [arm1]));

    

    //create arm2
    let arm2 = createArm1To3MaterialNode(new CustomTextureNode(resources.steel, [new RenderSGNode(resources.arm2)]));
    
    //add arm2 to scene graph
    totalArmTransformNode.append(new TransformationSGNode(glm.translate(arm2Pos[0], arm2Pos[1], arm2Pos[2]), [arm2]));

    

    //create arm3
    let arm3 = createArm1To3MaterialNode(new CustomTextureNode(resources.steel, [new RenderSGNode(resources.arm3)]));
    
    //add arm3 to scene graph
    totalArmTransformNode.append(new TransformationSGNode(glm.translate(arm3Pos[0], arm3Pos[1], arm3Pos[2]), [arm3]));
    
    //create transform node for arm4
    arm4RotationTransformation = new TransformationSGNode(glm.translate(arm4Pos[0], arm4Pos[1], arm4Pos[2]));
    
    //create arm4
    let arm4 = createArm4To7MaterialNode(new CustomTextureNode(resources.white_plastic, [new RenderSGNode(resources.arm4)]));
    
    //add arm4 to scene graph
    totalArmTransformNode.append(arm4RotationTransformation);
    arm4RotationTransformation.append(arm4);

    

    //create arm5
    let arm5 = createArm4To7MaterialNode(new CustomTextureNode(resources.white_plastic, [new RenderSGNode(resources.arm5)]));

    //calculate relative position for arm5
    let arm5RelativeToArm4 = vec3.subtract(vec3.create(), arm5Pos, arm4Pos);
    //add arm5 to scene graph
    arm4.append(new TransformationSGNode(glm.translate(arm5RelativeToArm4[0], arm5RelativeToArm4[1], arm5RelativeToArm4[2]), [arm5]));

    

    //create arm6
    let arm6 = createArm4To7MaterialNode(new CustomTextureNode(resources.white_plastic, [new RenderSGNode(resources.arm6)]));

    //calculate relative position for arm6
    let arm6RelativeToArm5 = vec3.subtract(vec3.create(), arm6Pos, arm5Pos);
    //add arm6 to scene graph
    arm5.append(new TransformationSGNode(glm.translate(arm6RelativeToArm5[0], arm6RelativeToArm5[1], arm6RelativeToArm5[2]), [arm6]));

    
    
    //create arm7
    let arm7 = new createArm4To7MaterialNode(new CustomTextureNode(resources.white_plastic, [new RenderSGNode(resources.arm7)]));
    
    //calculate relative position for arm7
    let arm7RelativeToArm6 = vec3.subtract(vec3.create(), arm7Pos, arm6Pos);
    //add arm7 to scene graph
    arm6.append(new TransformationSGNode(glm.translate(arm7RelativeToArm6[0], arm7RelativeToArm6[1], arm7RelativeToArm6[2]), [arm7]));

    
    
    //create transform node for gripper and translate it relative to arm7
    let gripperRelativeToArm7 = vec3.subtract(vec3.create(), gripperPos, arm7Pos);
    gripperRotationTransformation = new TransformationSGNode(glm.translate(gripperRelativeToArm7[0], gripperRelativeToArm7[1], gripperRelativeToArm7[2]));

    //create gripper
    gripper = new MaterialSGNode(new CustomTextureNode(resources.red_aluminum, [
        new RenderSGNode(resources.gripper)
    ]));

    gripper.ambient = [0.1, 0.18725, 0.1745, 0.8];
    gripper.diffuse = [0.396, 0.74151, 0.69102, 0.8];
    gripper.specular = [0.297254, 0.30829, 0.306678, 0.8];
    gripper.shininess = 12.8;
    
    arm7.append(gripperRotationTransformation);
    gripperRotationTransformation.append(gripper);

    
    
    //create "right" table
    let pickUpTable = new MaterialSGNode([
        new RenderSGNode(resources.table)
    ]);

    pickUpTable.ambient = [0.2125, 0.1275, 0.054, 1.0];
    pickUpTable.diffuse = [0.714, 0.4284, 0.18144, 1.0];
    pickUpTable.specular = [0.393548, 0.271906, 0.166721, 1.0];
    pickUpTable.shininess = 25.6;
    
    //add "right" table to scene graph
    root.append(new TransformationSGNode(glm.transform({
        translate: [-2.6, 0, 0],
        rotateY: 90,
        scale: [1, 1, 2]
    }), [pickUpTable]));

    
    
    //create "left" table 
    let putDownTable = new MaterialSGNode([
        new RenderSGNode(resources.table)
    ]);

    putDownTable.ambient = [0.2125, 0.1275, 0.054, 1.0];
    putDownTable.diffuse = [0.714, 0.4284, 0.18144, 1.0];
    putDownTable.specular = [0.393548, 0.271906, 0.166721, 1.0];
    putDownTable.shininess = 25.6;
    
    //add "left" table to scene graph
    root.append(new TransformationSGNode(glm.transform({
        translate: [0, 0, -2.4],
        scale: [1.5, 1, 2]
    }), [putDownTable]));

    
    
    //create transform node for rbPi
    rbPiTransformation = new TransformationSGNode(glm.transform({
        translate: [-2.6, 0.94, 0],
        scale: [0.1, 0.1, 0.1]
    }));

    //create rbPi
    rbPi = new MaterialSGNode([
        new RenderSGNode(resources.rb_pi)
    ]);

    rbPi.ambient = [0.23125, 0.23125, 0.23125, 1.0];
    rbPi.diffuse = [0.2775, 0.2775, 0.2775, 1.0];
    rbPi.specular = [0.773911, 0.773911, 0.773911, 1.0];
    rbPi.shininess = 89.6;
    
    root.append(rbPiTransformation);
    rbPiTransformation.append(rbPi);

    
    
    //create circuitBoard
    let circuitBoard = new MaterialSGNode([
        new RenderSGNode(resources.circuit_board)
    ]);

    circuitBoard.ambient = [0.23125, 0.23125, 0.23125, 1.0];
    circuitBoard.diffuse = [0.2775, 0.2775, 0.2775, 1.0];
    circuitBoard.specular = [0.773911, 0.773911, 0.773911, 1.0];
    circuitBoard.shininess = 89.6;
    
    //add circuitBoard to scene graph
    root.append(new TransformationSGNode(glm.transform({
        translate: [-2.6, 0.96, -0.7],
        scale: [0.05, 0.05, 0.05]
    }), [circuitBoard]));

    
    
    //create transform node for arduino
    arduinoTransformation = new TransformationSGNode(glm.transform({
        translate: [0.74, 0.90, -2.4],
        scale: [.1, .1, .1],
        rotateY: 75,
    }));

    //create arduino
    let arduino = new MaterialSGNode([
        new RenderSGNode(resources.arduino)
    ]);

    arduino.ambient = [0.23125, 0.23125, 0.23125, 1.0];
    arduino.diffuse = [0.2775, 0.2775, 0.2775, 1.0];
    arduino.specular = [0.773911, 0.773911, 0.773911, 1.0];
    arduino.shininess = 89.6;
    
    root.append(arduinoTransformation);
    arduinoTransformation.append(arduino);

    
    
    //create conveyor belt / cubemapped
    let conveyor = new EnvironmentSGNode(envcubetexture, 4, true, [
        new RenderSGNode(resources.conveyor)
    ]);
    
    //add conveyor belt to scene graph
    root.append(new TransformationSGNode(glm.transform({
        translate: [3, 0, 0],
        scale: [1.31, 1.31, 1.31],
        rotateY: 90
    }), [conveyor]));

    
    //create box
    let box = new MaterialSGNode([
        new RenderSGNode(resources.box)
    ]);

    box.ambient = [0.19125, 0.0735, 0.0225, 1.0];
    box.diffuse = [0.7038, 0.27048, 0.0828, 1.0];
    box.specular = [0.256777, 0.137622, 0.086014, 1.0];
    box.shininess = 2.8;
    
    //add box to scene graph
    root.append(new TransformationSGNode(glm.transform({
        translate: [4.8, 0, 0],
        scale: [0.4, 0.4, 0.4]
    }),[box]));

    //create rail
    let rail = new MaterialSGNode([
        new RenderSGNode(resources.rail)
    ]);

    rail.ambient = [0.2312, 0.2312, 0.2312, 1.0];
    rail.diffuse = [0.2775, 0.2775, 0.2775, 1.0];
    rail.specular = [0.773911, 0.773911, 0.773911, 1.0];
    rail.shininess = 89.6;
    

    //add rail to scene graph
    root.append(new TransformationSGNode(glm.transform({
        translate: [0, 0.05, 2.64],
        scale: [3, 1, 1.5],
        rotateY: 90
    }), [rail]));

    //create ceiling_light1
    let ceiling_light_casing1 = createCeilingLightCasingMaterialNode(new RenderSGNode(resources.ceiling_light_casing));
    let ceiling_light_light1 = createCeilingLightMaterialNode(new RenderSGNode(resources.ceiling_light_light));


    //add ceiling_light1 to scene graph
    root.append(new TransformationSGNode(glm.transform({
        translate: [-5, 11.8, -5],
        scale: [2, 2, 2],
        rotateY: 90
    }), [ceiling_light_casing1, ceiling_light_light1]));

    //create ceiling_light2
    let ceiling_light_casing2 = createCeilingLightCasingMaterialNode(new RenderSGNode(resources.ceiling_light_casing));
    let ceiling_light_light2 = createCeilingLightMaterialNode(new RenderSGNode(resources.ceiling_light_light));

    //add ceiling_light2 to scene graph
    root.append(new TransformationSGNode(glm.transform({
        translate: [-5, 11.8, 5],
        scale: [2, 2, 2],
        rotateY: 90
    }), [ceiling_light_casing2, ceiling_light_light2]));

    //create ceiling_light3
    let ceiling_light_casing3 = createCeilingLightCasingMaterialNode(new RenderSGNode(resources.ceiling_light_casing));
    let ceiling_light_light3 = createCeilingLightMaterialNode(new RenderSGNode(resources.ceiling_light_light));

    //add ceiling_light3 to scene graph
    root.append(new TransformationSGNode(glm.transform({
        translate: [5, 11.8, -5],
        scale: [2, 2, 2],
        rotateY: 90
    }), [ceiling_light_casing3, ceiling_light_light3]));

    //create ceiling_light4
    let ceiling_light_casing4 = createCeilingLightCasingMaterialNode(new RenderSGNode(resources.ceiling_light_casing));
    let ceiling_light_light4 = createCeilingLightMaterialNode(new RenderSGNode(resources.ceiling_light_light));

    //add ceiling_light4 to scene graph
    root.append(new TransformationSGNode(glm.transform({
        translate: [5, 11.8, 5],
        scale: [2, 2, 2],
        rotateY: 90
    }), [ceiling_light_casing4, ceiling_light_light4]));

    //create spotlight_stand
    let spotlight_stand = new MaterialSGNode([
        new RenderSGNode(resources.spotlight_stand)
    ]);

    spotlight_stand.ambient = [0.2312, 0.2312, 0.2312, 1.0];
    spotlight_stand.diffuse = [0.2775, 0.2775, 0.2775, 1.0];
    spotlight_stand.specular = [0.773911, 0.773911, 0.773911, 1.0];
    spotlight_stand.shininess = 89.6;

    //define transformNodes for whole spotlight and the upper part (body) of the spotlight
    let spotlightTransformNode = new TransformationSGNode(glm.transform({translate : [-1.5, 0, -5], rotateY: 18}))
    let spotlightBodyTransformNode = new TransformationSGNode(mat4.rotateX(mat4.create(), glm.translate(0, 3.39224, 0.000203), glm.deg2rad( 45)));
    root.append(spotlightTransformNode);
    spotlightTransformNode.append(spotlightBodyTransformNode);

    //add spotlight_stand to scene graph
    spotlightTransformNode.append(new TransformationSGNode(glm.transform({
        translate: [0, 0.000215, 0],
        scale: [1, 1, 1],
        rotateY: 0
    }), [spotlight_stand]));

    //create spotlight_light (upper part without lightbulb (front facing white plane))
    let spotlight_light = new MaterialSGNode([
        new RenderSGNode(resources.spotlight_light)
    ]);

    spotlight_light.ambient = [0.2312, 0.2312, 0.2312, 1.0];
    spotlight_light.diffuse = [0.2775, 0.2775, 0.2775, 1.0];
    spotlight_light.specular = [0.773911, 0.773911, 0.773911, 1.0];
    spotlight_light.shininess = 89.6;

    //add spotlight_light to scene graph
    spotlightBodyTransformNode.append(spotlight_light);

    //create spotlight_lightbulb
    let spotlight_lightbulb = new MaterialSGNode([
        new RenderSGNode(resources.spotlight_lightbulb)
    ]);
    spotlight_lightbulb.emission = [1, 1, 1, 1];

    //add spotlight_lightbulb to scene graph
    spotlightBodyTransformNode.append(spotlight_lightbulb);

    //animations
    initAnimations();

    return root;
}

/**
 * render one frame
 */
function render(timeInMilliseconds) {
    // check for resize of browser window and adjust canvas sizes
    checkForWindowResize(gl);

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    //clear the buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //enable depth test to let objects in front occluse objects further away
    gl.enable(gl.DEPTH_TEST);

    //Create projection Matrix and context for rendering.
    const context = createSGContext(gl);
    context.projectionMatrix = mat4.perspective(mat4.create(), glm.deg2rad(30), gl.drawingBufferWidth / gl.drawingBufferHeight, 0.01, 100);
    context.viewMatrix = mat4.lookAt(mat4.create(), [0, 1, -10], [0, 0, 0], [0, 1, 0]);

    var deltaTime = timeInMilliseconds - previousTime;
    previousTime = timeInMilliseconds;

    //skipping animation as long as page is not yet rendered and therefore frames take longer
    if (deltaTime > 200) {
        requestAnimationFrame(render);
        return;
    }

    //update animation BEFORE camera
    startCameraAnimation(deltaTime);
    camera.update(deltaTime);

    //starting 20 second animation
    startAnimation(deltaTime);

    //Apply camera
    camera.render(context);

    context.invViewMatrix = mat4.invert(mat4.create(), context.viewMatrix);

    //Render scene
    root.render(context);

    //request another call as soon as possible
    requestAnimationFrame(render);
}

//defining material for the first 3 parts of the robotic arm
function createArm1To3MaterialNode(renderNode) {
    let materialNode = new MaterialSGNode([renderNode]);
    materialNode.ambient = [0.19225, 0.19225, 0.19225, 1];
    materialNode.diffuse = [0.50754, 0.50754, 0.50754, 1];
    materialNode.specular = [0.508273, 0.508273, 0.508273, 1];
    materialNode.shininess = 51.2;
    
    return materialNode;
}

//defining material for the first next 4 parts of the robotic arm
function createArm4To7MaterialNode(renderNode) {
    let materialNode = new MaterialSGNode([renderNode]);
    materialNode.ambient = [0.105882, 0.058824, 0.113725, 1];
    materialNode.diffuse = [0.427451, 0.470588, 0.541176, 1];
    materialNode.specular = [0.333333, 0.333333, 0.521569, 1];
    materialNode.shininess = 9.84615;

    return materialNode;
}

//defining material for the casing of the 4 ceiling lights
function createCeilingLightCasingMaterialNode(renderNode) {
    let materialNode = new MaterialSGNode([renderNode]);
    materialNode.ambient = [0.25, 0.25, 0.25, 1.0];
    materialNode.diffuse = [0.4, 0.4, 0.4, 1.0];
    materialNode.specular = [0.274597, 0.274597, 0.274597, 1.0];
    materialNode.shininess = 36.8;

    return materialNode;
}

//defining material for the light tubes of the 4 ceiling lights
function createCeilingLightMaterialNode(renderNode) {
    let materialNode = new MaterialSGNode([renderNode]);
    materialNode.ambient = [0.2, 0.2, 0.2, 1.0];
    materialNode.diffuse = [1, 1, 1, 1.0];
    materialNode.specular = [0.8, 0.8, 0.8, 1.0];
    materialNode.emission = [1, 1, 1, 1];
    materialNode.shininess = 51.2;

    return materialNode;
}

//defining ceiling light light node
function createCeilingLightLightNode() {
    let lightNode = new LightSGNode();
    lightNode.ambient = [.125, .125, .125, 1];
    lightNode.diffuse = [0.25, 0.25, 0.25, 1];
    lightNode.specular = [0.25, 0.25, 0.25, 1];
    
    return lightNode;
}

//implementation of a spotlight based on LightSGNode
class SpotLightNode extends LightSGNode {
    constructor(position, children) {
        super(position, children);
        this.direction = [0, -1, 0];
        //cutOff angle
        this.cutOff = Math.cos(glm.deg2rad(15));
        this.uniform = 'u_spotlight';
    }

    setLightUniforms(context) {
        super.setLightUniforms(context);
        //prevent spotlight position being affected by camera position by transforming direction vector with normal matrix of viewMatrix
        gl.uniform3fv(gl.getUniformLocation(context.shader, this.uniform+'.direction'), vec3.transformMat3(vec3.create(), this.direction, mat3.normalFromMat4(mat3.create, context.viewMatrix)));
        gl.uniform1f(gl.getUniformLocation(context.shader, this.uniform+'.cutOff'), this.cutOff);

    }
}

class CustomTextureNode extends AdvancedTextureSGNode {
    render(context) {
        gl.uniform1i(gl.getUniformLocation(context.shader, 'u_enableObjectTexture'), true);
        super.render(context);
        gl.uniform1i(gl.getUniformLocation(context.shader, 'u_enableObjectTexture'), false);
    }
}

function initCubeMap(resources) {
    //create the texture
    envcubetexture = gl.createTexture();
    //define some texture unit we want to work on
    gl.activeTexture(gl.TEXTURE0);
    //bind the texture to the texture unit
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, envcubetexture);
    //set sampling parameters
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.MIRRORED_REPEAT); //will be available in WebGL 2
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    //set correct image for each side of the cube map
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);//flipping required for our skybox, otherwise images don't fit together
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.env_pos_x);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.env_neg_x);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.env_pos_y);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.env_neg_y);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.env_pos_z);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.env_neg_z);
    //unbind the texture again
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
}

class EnvironmentSGNode extends SGNode {

    constructor(envtexture, textureunit, doReflect, children ) {
        super(children);
        this.envtexture = envtexture;
        this.textureunit = textureunit;
        this.doReflect = doReflect;
    }

    render(context)
    {
        //set additional shader parameters
        let invView3x3 = mat3.fromMat4(mat3.create(), context.invViewMatrix); //reduce to 3x3 matrix since we only process direction vectors (ignore translation)
        gl.uniformMatrix3fv(gl.getUniformLocation(context.shader, 'u_invView'), false, invView3x3);
        gl.uniform1i(gl.getUniformLocation(context.shader, 'u_texCube'), this.textureunit);
        gl.uniform1i(gl.getUniformLocation(context.shader, 'u_useReflection'), this.doReflect);

        //activate and bind texture
        gl.activeTexture(gl.TEXTURE0 + this.textureunit);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.envtexture);

        //disable lighting for the skybox, s.t. it is not overexposed
        gl.uniform1i(gl.getUniformLocation(context.shader, 'u_applyLights'), 0);

        //render children
        super.render(context);

        //clean up
        //enable lighting again for the rest of the objects
        gl.uniform1i(gl.getUniformLocation(context.shader, 'u_applyLights'), 1);

        gl.activeTexture(gl.TEXTURE0 + this.textureunit);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    }
}


