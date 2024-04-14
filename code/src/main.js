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
    cameraAnimation.start()
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
    let light = new LightSGNode();
    light.ambient = [.5, .5, .5, 1];
    light.diffuse = [1, 1, 1, 1];
    light.specular = [1, 1, 1, 1];
    light.position = [-2.5, 3, -2.5];
    light.append(createLightSphere(resources));
    // add light to scenegraph
    root.append(light);

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
    totalArmTransformNode.append(new TransformationSGNode(mat4.create(),[base]));

    

    //create arm1
    let arm1 = new MaterialSGNode([
        new RenderSGNode(resources.arm1)
    ]);
    
    //add arm1 to scene graph
    totalArmTransformNode.append(new TransformationSGNode(glm.translate(arm1Pos[0], arm1Pos[1], arm1Pos[2]), [arm1]));

    

    //create arm2
    let arm2 = new MaterialSGNode([
        new RenderSGNode(resources.arm2)
    ]);
    
    //add arm2 to scene graph
    totalArmTransformNode.append(new TransformationSGNode(glm.translate(arm2Pos[0], arm2Pos[1], arm2Pos[2]), [arm2]));

    

    //create arm3
    let arm3 = new MaterialSGNode([
        new RenderSGNode(resources.arm3)
    ]);
    
    //add arm3 to scene graph
    totalArmTransformNode.append(new TransformationSGNode(glm.translate(arm3Pos[0], arm3Pos[1], arm3Pos[2]), [arm3]));

    
    
    //create transform node for arm4
    arm4RotationTransformation = new TransformationSGNode(glm.translate(arm4Pos[0], arm4Pos[1], arm4Pos[2]));
    
    //create arm4
    let arm4 = new MaterialSGNode([
        new RenderSGNode(resources.arm4)
    ]);
    
    //add arm4 to scene graph
    totalArmTransformNode.append(arm4RotationTransformation);
    arm4RotationTransformation.append(arm4);

    

    //create arm5
    let arm5 = new MaterialSGNode([
        new RenderSGNode(resources.arm5)
    ]);

    //calculate relative position for arm5
    let arm5RelativeToArm4 = vec3.subtract(vec3.create(), arm5Pos, arm4Pos);
    //add arm5 to scene graph
    arm4.append(new TransformationSGNode(glm.translate(arm5RelativeToArm4[0], arm5RelativeToArm4[1], arm5RelativeToArm4[2]), [arm5]));

    

    //create arm6
    let arm6 = new MaterialSGNode([
        new RenderSGNode(resources.arm6)
    ]);

    //calculate relative position for arm6
    let arm6RelativeToArm5 = vec3.subtract(vec3.create(), arm6Pos, arm5Pos);
    //add arm6 to scene graph
    arm5.append(new TransformationSGNode(glm.translate(arm6RelativeToArm5[0], arm6RelativeToArm5[1], arm6RelativeToArm5[2]), [arm6]));

    
    
    //create arm7
    let arm7 = new MaterialSGNode([
        new RenderSGNode(resources.arm7)
    ]);
    
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
    arm7.append(gripperRotationTransformation);
    gripperRotationTransformation.append(gripper);

    
    
    //create "right" table
    let pickUpTable = new MaterialSGNode([
        new RenderSGNode(resources.table)
    ]);
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
    root.append(rbPiTransformation);
    rbPiTransformation.append(rbPi);

    
    
    //create circuitBoard
    let circuitBoard = new MaterialSGNode([
        new RenderSGNode(resources.circuit_board)
    ]);
    
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
    root.append(arduinoTransformation);
    arduinoTransformation.append(arduino);

    
    
    //create conveyor belt
    let conveyor = new MaterialSGNode([
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
    
    //add box to scene graph
    root.append(new TransformationSGNode(glm.transform({
        translate: [4.8, 0, 0],
        scale: [0.4, 0.4, 0.4]
    }),[box]));

    

    //create rail
    let rail = new MaterialSGNode([
        new RenderSGNode(resources.rail)
    ]);
    
    //add rail to scene graph
    root.append(new TransformationSGNode(glm.transform({
        translate: [0, 0.05, 2.64],
        scale: [3, 1, 1.5],
        rotateY: 90
    }), [rail]));

    
    
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

