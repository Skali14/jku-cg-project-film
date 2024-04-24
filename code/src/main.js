//the OpenGL context
var gl = null,
    program = null;


//Camera
var camera = null;
var cameraPos = vec3.create();
var cameraCenter = vec3.create();
var cameraAnimation = null;

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
    base: './src/models/Base.obj',
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
    box: './src/models/box.obj',
    circuit_board: './src/models/circuit_board.obj',
    rail: './src/models/rail.obj',
    wall_ceiling: './src/models/wall_ceiling.obj',
    ceiling_light_casing: './src/models/ceiling_light_casing.obj',
    ceiling_light_light: './src/models/ceiling_light_light.obj',
    spotlight_stand: './src/models/spotlight_stand.obj',
    spotlight_light: './src/models/spotlight_light.obj',
    spotlight_lightbulb: './src/models/spotlight_lightbulb.obj',
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

    //setup camera
    cameraStartPos = vec3.fromValues(0, 2, -11);
    camera = new UserControlledCamera(gl.canvas, cameraStartPos);
    //set up an animation for the camera, moving it into position
    cameraAnimation = new Animation(camera,
        [{matrix: mat4.translate(mat4.create(), mat4.create(), vec3.fromValues(0, 1, -10)), duration: 5000}],
        false);
    cameraAnimation.start();
    
    root = createSceneGraph(gl, resources);
}


function createSceneGraph(gl, resources) {
    //create scenegraph
    const root = new ShaderSGNode(createProgram(gl, resources.vs, resources.fs))

    // create node with different shaders
    function createLightSphere() {
        return new ShaderSGNode(createProgram(gl, resources.vs_single, resources.fs_single), [
            new RenderSGNode(makeSphere(.2, 10, 10))
        ]);
    }
    
    

    // create white light node
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

    let spotLight = new SpotLightNode();
    spotLight.position = [-1.45, 3.2, -4.96];
    spotLight.ambient = [.75, .75, .75, 1];
    spotLight.diffuse = [1, 1, 1, 1];
    spotLight.specular = [1, 1, 1, 1];
    spotLight.cutOff = Math.cos(glm.deg2rad(9));
    spotLight.direction = [1.45, -4.4, 4.9];
    root.append(spotLight);

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
    root.append(new TransformationSGNode(glm.transform({translate: [0, 0, 0], rotateX: -90, scale: 3}), [
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
    let base = new MaterialSGNode([
        new RenderSGNode(resources.base)
    ]);

    base.ambient = [0.05375, 0.05, 0.06625, 0.82];
    base.diffuse = [0.18275, 0.17, 0.22525, 0.82];
    base.specular = [0.332741, 0.328634, 0.346435, 0.82];
    base.shininess = 38.4;
    
    totalArmTransformNode.append(new TransformationSGNode(mat4.create(),[base]));

    //create arm1
    let arm1 = createArm1To3MaterialNode(new RenderSGNode(resources.arm1));
    
    //add arm1 to scene graph
    totalArmTransformNode.append(new TransformationSGNode(glm.translate(arm1Pos[0], arm1Pos[1], arm1Pos[2]), [arm1]));

    

    //create arm2
    let arm2 = createArm1To3MaterialNode(new RenderSGNode(resources.arm2));
    
    //add arm2 to scene graph
    totalArmTransformNode.append(new TransformationSGNode(glm.translate(arm2Pos[0], arm2Pos[1], arm2Pos[2]), [arm2]));

    

    //create arm3
    let arm3 = createArm1To3MaterialNode(new RenderSGNode(resources.arm3));
    
    //add arm3 to scene graph
    totalArmTransformNode.append(new TransformationSGNode(glm.translate(arm3Pos[0], arm3Pos[1], arm3Pos[2]), [arm3]));

    
    
    //create transform node for arm4
    arm4RotationTransformation = new TransformationSGNode(glm.translate(arm4Pos[0], arm4Pos[1], arm4Pos[2]));
    
    //create arm4
    let arm4 = createArm4To7MaterialNode(new RenderSGNode(resources.arm4));
    
    //add arm4 to scene graph
    totalArmTransformNode.append(arm4RotationTransformation);
    arm4RotationTransformation.append(arm4);

    

    //create arm5
    let arm5 = createArm4To7MaterialNode(new RenderSGNode(resources.arm5));

    //calculate relative position for arm5
    let arm5RelativeToArm4 = vec3.subtract(vec3.create(), arm5Pos, arm4Pos);
    //add arm5 to scene graph
    arm4.append(new TransformationSGNode(glm.translate(arm5RelativeToArm4[0], arm5RelativeToArm4[1], arm5RelativeToArm4[2]), [arm5]));

    

    //create arm6
    let arm6 = createArm4To7MaterialNode(new RenderSGNode(resources.arm6));

    //calculate relative position for arm6
    let arm6RelativeToArm5 = vec3.subtract(vec3.create(), arm6Pos, arm5Pos);
    //add arm6 to scene graph
    arm5.append(new TransformationSGNode(glm.translate(arm6RelativeToArm5[0], arm6RelativeToArm5[1], arm6RelativeToArm5[2]), [arm6]));

    
    
    //create arm7
    let arm7 = new createArm4To7MaterialNode(new RenderSGNode(resources.arm7));
    
    //calculate relative position for arm7
    let arm7RelativeToArm6 = vec3.subtract(vec3.create(), arm7Pos, arm6Pos);
    //add arm7 to scene graph
    arm6.append(new TransformationSGNode(glm.translate(arm7RelativeToArm6[0], arm7RelativeToArm6[1], arm7RelativeToArm6[2]), [arm7]));

    
    
    //create transform node for gripper and translate it relative to arm7
    let gripperRelativeToArm7 = vec3.subtract(vec3.create(), gripperPos, arm7Pos);
    gripperRotationTransformation = new TransformationSGNode(glm.translate(gripperRelativeToArm7[0], gripperRelativeToArm7[1], gripperRelativeToArm7[2]));

    //create gripper
    gripper = new MaterialSGNode([
        new RenderSGNode(resources.gripper)
    ]);

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

    
    
    //create conveyor belt
    let conveyor = new MaterialSGNode([
        new RenderSGNode(resources.conveyor)
    ]);

    conveyor.ambient = [0.05375, 0.05, 0.06625, 0.82];
    conveyor.diffuse = [0.18275, 0.17, 0.22525, 0.82];
    conveyor.specular = [0.33274, 0.328634, 0.346435, 0.82];
    conveyor.shininess = 38.4;
    
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
    

    root.append(new TransformationSGNode(glm.transform({
        translate: [0, 0.05, 2.64],
        scale: [3, 1, 1.5],
        rotateY: 90
    }), [rail]));

    let wall_ceiling = new MaterialSGNode([
        new RenderSGNode(resources.wall_ceiling)
    ]);

    wall_ceiling.ambient = [0.25, 0.25, 0.25, 1.0];
    wall_ceiling.diffuse = [0.4, 0.4, 0.4, 1.0];
    wall_ceiling.specular = [0.274597, 0.274597, 0.274597, 1.0];
    wall_ceiling.shininess = 36.8;


    root.append(new TransformationSGNode(glm.transform({
        translate: [0, 0, 0],
        scale: [1.5, 0.75, 1.5],
        rotateY: 90
    }), [wall_ceiling]));

    let ceiling_light_casing1 = createCeilingLightCasingMaterialNode(new RenderSGNode(resources.ceiling_light_casing));
    let ceiling_light_light1 = createCeilingLightMaterialNode(new RenderSGNode(resources.ceiling_light_light));


    root.append(new TransformationSGNode(glm.transform({
        translate: [-3, 5.9, -3],
        scale: [2, 2, 2],
        rotateY: 90
    }), [ceiling_light_casing1, ceiling_light_light1]));

    let ceiling_light_casing2 = createCeilingLightCasingMaterialNode(new RenderSGNode(resources.ceiling_light_casing));
    let ceiling_light_light2 = createCeilingLightMaterialNode(new RenderSGNode(resources.ceiling_light_light));


    root.append(new TransformationSGNode(glm.transform({
        translate: [-3, 5.9, 3],
        scale: [2, 2, 2],
        rotateY: 90
    }), [ceiling_light_casing2, ceiling_light_light2]));

    let ceiling_light_casing3 = createCeilingLightCasingMaterialNode(new RenderSGNode(resources.ceiling_light_casing));
    let ceiling_light_light3 = createCeilingLightMaterialNode(new RenderSGNode(resources.ceiling_light_light));


    root.append(new TransformationSGNode(glm.transform({
        translate: [3, 5.9, -3],
        scale: [2, 2, 2],
        rotateY: 90
    }), [ceiling_light_casing3, ceiling_light_light3]));

    let ceiling_light_casing4 = createCeilingLightCasingMaterialNode(new RenderSGNode(resources.ceiling_light_casing));
    let ceiling_light_light4 = createCeilingLightMaterialNode(new RenderSGNode(resources.ceiling_light_light));


    root.append(new TransformationSGNode(glm.transform({
        translate: [3, 5.9, 3],
        scale: [2, 2, 2],
        rotateY: 90
    }), [ceiling_light_casing4, ceiling_light_light4]));

    let spotlight_stand = new MaterialSGNode([
        new RenderSGNode(resources.spotlight_stand)
    ]);

    spotlight_stand.ambient = [0.2312, 0.2312, 0.2312, 1.0];
    spotlight_stand.diffuse = [0.2775, 0.2775, 0.2775, 1.0];
    spotlight_stand.specular = [0.773911, 0.773911, 0.773911, 1.0];
    spotlight_stand.shininess = 89.6;

    let spotlightTransformNode = new TransformationSGNode(glm.transform({translate : [-1.5, 0, -5], rotateY: 30}))
    let spotlightBodyTransformNode = new TransformationSGNode(mat4.rotateX(mat4.create(), glm.translate(0, 1, -2.35), glm.deg2rad( 45)));
    root.append(spotlightTransformNode);
    spotlightTransformNode.append(spotlightBodyTransformNode);


    spotlightTransformNode.append(new TransformationSGNode(glm.transform({
        translate: [0, 0.000215, 0],
        scale: [1, 1, 1],
        rotateY: 0
    }), [spotlight_stand]));

    let spotlight_light = new MaterialSGNode([
        new RenderSGNode(resources.spotlight_light)
    ]);

    spotlight_light.ambient = [0.2312, 0.2312, 0.2312, 1.0];
    spotlight_light.diffuse = [0.2775, 0.2775, 0.2775, 1.0];
    spotlight_light.specular = [0.773911, 0.773911, 0.773911, 1.0];
    spotlight_light.shininess = 89.6;

    spotlightBodyTransformNode.append(new TransformationSGNode(glm.transform({
        translate: [0, 3.39224, 0.000203],
        scale: [1, 1, 1],
        rotateY: 0
    }), [spotlight_light]));

    let spotlight_lightbulb = new MaterialSGNode([
        new RenderSGNode(resources.spotlight_lightbulb)
    ]);
    spotlight_lightbulb.emission = [1, 1, 1, 1];

    spotlightBodyTransformNode.append(new TransformationSGNode(glm.transform({
        translate: [0, 3.39224, 0.000203],
        scale: [1, 1, 1],
        rotateY: 0
    }), [spotlight_lightbulb]));
    

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
    if (deltaTime > 50) {
        requestAnimationFrame(render);
        return;
    }

    //starting 20 second animation
    startAnimation(deltaTime);

    //disabled for development
    //update animation BEFORE camera
    //cameraAnimation.update(deltaTime);
    camera.update(deltaTime);
    camera.control.enabled = true;

    //disabled for development
    //At the end of the automatic flight, switch to manual control
    //if(!cameraAnimation.running && !camera.control.enabled) {
    //  camera.control.enabled = true;
    //}


    //Apply camera
    camera.render(context);

    //Render scene
    root.render(context);

    //request another call as soon as possible
    requestAnimationFrame(render);
}

function createArm1To3MaterialNode(renderNode) {
    let materialNode = new MaterialSGNode([renderNode]);
    materialNode.ambient = [0.19225, 0.19225, 0.19225, 1];
    materialNode.diffuse = [0.50754, 0.50754, 0.50754, 1];
    materialNode.specular = [0.508273, 0.508273, 0.508273, 1];
    materialNode.shininess = 51.2;
    
    return materialNode;
}

function createArm4To7MaterialNode(renderNode) {
    let materialNode = new MaterialSGNode([renderNode]);
    materialNode.ambient = [0.105882, 0.058824, 0.113725, 1];
    materialNode.diffuse = [0.427451, 0.470588, 0.541176, 1];
    materialNode.specular = [0.333333, 0.333333, 0.521569, 1];
    materialNode.shininess = 9.84615;

    return materialNode;
}

function createCeilingLightCasingMaterialNode(renderNode) {
    let materialNode = new MaterialSGNode([renderNode]);
    materialNode.ambient = [0.25, 0.25, 0.25, 1.0];
    materialNode.diffuse = [0.4, 0.4, 0.4, 1.0];
    materialNode.specular = [0.274597, 0.274597, 0.274597, 1.0];
    materialNode.shininess = 36.8;

    return materialNode;
}

function createCeilingLightMaterialNode(renderNode) {
    let materialNode = new MaterialSGNode([renderNode]);
    materialNode.ambient = [0.2, 0.2, 0.2, 1.0];
    materialNode.diffuse = [1, 1, 1, 1.0];
    materialNode.specular = [0.8, 0.8, 0.8, 1.0];
    materialNode.emission = [1, 1, 1, 1];
    materialNode.shininess = 51.2;

    return materialNode;
}

function createCeilingLightLightNode() {
    let lightNode = new LightSGNode();
    lightNode.ambient = [.125, .125, .125, 1];
    lightNode.diffuse = [0.25, 0.25, 0.25, 1];
    lightNode.specular = [0.25, 0.25, 0.25, 1];
    
    return lightNode;
}

class SpotLightNode extends LightSGNode {
    constructor(position, children) {
        super(position, children);
        this.direction = [0, -1, 0];
        this.cutOff = Math.cos(glm.deg2rad(15));
        this.uniform = 'u_spotlight';
    }

    setLightUniforms(context) {
        super.setLightUniforms(context);
        //prevent spotlight position being affected by viewMatrix (camera position and rotation)
        gl.uniform3f(gl.getUniformLocation(context.shader, this.uniform + 'Pos'), this.position[0], this.position[1], this.position[2]);
        gl.uniform3fv(gl.getUniformLocation(context.shader, this.uniform+'.direction'), this.direction);
        gl.uniform1f(gl.getUniformLocation(context.shader, this.uniform+'.cutOff'), this.cutOff);
        gl.uniformMatrix4fv(gl.getUniformLocation(context.shader, 'u_invViewMatrix'), false, mat4.invert(mat4.create(), context.viewMatrix));

    }
}



