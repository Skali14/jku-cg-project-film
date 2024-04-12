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

let arm1RotationTransformation;
let arm2RotationTransformation;
let arm3RotationTransformation;
let arm4RotationTransformation;
let arm5RotationTransformation;
let arm6RotationTransformation;
let arm7RotationTransformation;
let gripperRotationTransformation;
let totalArmRotationAnimation;

let arm4AnimationPickUp;
let arm4AnimationPutDown;

let armScaleTransformNode;

var animatedAngle = 0;

let arm1Pos = vec3.fromValues(-0.010286, 3.86388, 0);
let arm2Pos = vec3.fromValues(-3.42716, 3.86384, 0);
let arm3Pos = vec3.fromValues(-3.52398, 7.22754, 0);
let arm4Pos = vec3.fromValues(-0.116274, 7.22754, 0);
let arm5Pos = vec3.fromValues(0.745563, 9.8, 0);
let arm6Pos = vec3.fromValues(3.61406, 12.816, 0);
let arm7Pos = vec3.fromValues(7.62936, 9.28162, 0);
let gripperPos = vec3.fromValues(9.60342, 4.84615, 0);

//load the shader resources using a utility function
loadResources({
  vs: './src/shader/phong.vs.glsl',
  fs: './src/shader/phong.fs.glsl',
  vs_single: './src/shader/single.vs.glsl',
  fs_single: './src/shader/single.fs.glsl',
  c3po: './src/models/C-3PO.obj',
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
  cameraStartPos = vec3.fromValues(0, 1, -10);
  camera = new UserControlledCamera(gl.canvas, cameraStartPos);
  //setup an animation for the camera, moving it into position
  cameraAnimation = new Animation(camera, 
            [{matrix: mat4.translate(mat4.create(), mat4.create(), vec3.fromValues(0, 1, -10)), duration: 5000}], 
            false);
  cameraAnimation.start()
  //TODO create your own scenegraph
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
  root.append(new TransformationSGNode(glm.transform({ translate: [0, 0, 0], rotateX: -90, scale: 3}), [
    floor
  ]));

  //robotic arm scaling node
  armScaleTransformNode = new TransformationSGNode(glm.transform({translate: [0, 0.5, 0], rotateY: 180, scale: 0.30}));
  root.append(armScaleTransformNode);
  
  //create base
  let base = new MaterialSGNode([
      new RenderSGNode(resources.base)
  ]);
  armScaleTransformNode.append(base);

  arm1RotationTransformation = new TransformationSGNode(glm.translate(arm1Pos[0], arm1Pos[1], arm1Pos[2]));
  
  //create arm1
  let arm1 = new MaterialSGNode([
      new RenderSGNode(resources.arm1)
  ]);
  armScaleTransformNode.append(arm1RotationTransformation);
  arm1RotationTransformation.append(arm1);

  arm2RotationTransformation = new TransformationSGNode(glm.translate(arm2Pos[0], arm2Pos[1], arm2Pos[2]));

  //create arm2
  let arm2 = new MaterialSGNode([
    new RenderSGNode(resources.arm2)
  ]);
  armScaleTransformNode.append(arm2RotationTransformation);
  arm2RotationTransformation.append(arm2);

  arm3RotationTransformation = new TransformationSGNode(glm.translate(arm3Pos[0], arm3Pos[1], arm3Pos[2]));

  //create arm3
  let arm3 = new MaterialSGNode([
    new RenderSGNode(resources.arm3)
  ]);
  armScaleTransformNode.append(arm3RotationTransformation);
  arm3RotationTransformation.append(arm3);
  
  arm4RotationTransformation = new TransformationSGNode(glm.translate(arm4Pos[0], arm4Pos[1], arm4Pos[2]));
  
  
  //create arm4
  let arm4 = new MaterialSGNode([
    new RenderSGNode(resources.arm4)
  ]);
  armScaleTransformNode.append(arm4RotationTransformation);
  arm4RotationTransformation.append(arm4);

  let arm5MinusArm4 = vec3.subtract(vec3.create(),arm5Pos, arm4Pos);
  arm5RotationTransformation = new TransformationSGNode(glm.translate(arm5MinusArm4[0], arm5MinusArm4[1], arm5MinusArm4[2]));
  
  //create arm5
  let arm5 = new MaterialSGNode([
    new RenderSGNode(resources.arm5)
  ]);
  arm4.append(arm5RotationTransformation);
  arm5RotationTransformation.append(arm5);

  let arm6MinusArm5 = vec3.subtract(vec3.create(),arm6Pos, arm5Pos);
  arm6RotationTransformation = new TransformationSGNode(glm.translate(arm6MinusArm5[0], arm6MinusArm5[1], arm6MinusArm5[2]));

  //create arm6
  let arm6 = new MaterialSGNode([
    new RenderSGNode(resources.arm6)
  ]);
  arm5.append(arm6RotationTransformation);
  arm6RotationTransformation.append(arm6);

  let arm7MinusArm6 = vec3.subtract(vec3.create(),arm7Pos, arm6Pos);
  arm7RotationTransformation = new TransformationSGNode(glm.translate(arm7MinusArm6[0], arm7MinusArm6[1], arm7MinusArm6[2]));

  //create arm7
  let arm7 = new MaterialSGNode([
    new RenderSGNode(resources.arm7)
  ]);
  arm6.append(arm7RotationTransformation);
  arm7RotationTransformation.append(arm7);

  let gripperMinusArm7 = vec3.subtract(vec3.create(),gripperPos, arm7Pos);
  gripperRotationTransformation = new TransformationSGNode(glm.translate(gripperMinusArm7[0], gripperMinusArm7[1], gripperMinusArm7[2]));

  //create gripper
  let gripper = new MaterialSGNode([
    new RenderSGNode(resources.gripper)
  ]);
  arm7.append(gripperRotationTransformation);
  gripperRotationTransformation.append(gripper);

  let pickUpTableTransformation = new TransformationSGNode(glm.transform({translate: [-2.6, 0, 0], rotateY: 90, scale: [1, 1, 2]}));
  
  //create table
  let pickUpTable = new MaterialSGNode([
      new RenderSGNode(resources.table)
  ]);
  root.append(pickUpTableTransformation);
  pickUpTableTransformation.append(pickUpTable);

  let putDownTableTransformation = new TransformationSGNode(glm.transform({translate: [0, 0, -2.2], rotateY: 0, scale: [1.5, 1, 2]}));

  let putDownTable = new MaterialSGNode([
    new RenderSGNode(resources.table)
  ]);
  root.append(putDownTableTransformation);
  putDownTableTransformation.append(putDownTable);
  
  let rbPiTransformation = new TransformationSGNode(glm.transform({translate: [-2.6, 0.94, 0], scale: [0.1, 0.1, 0.1]}));
  
  let rbPi = new MaterialSGNode([
      new RenderSGNode(resources.rb_pi)
  ]);
  root.append(rbPiTransformation);
  rbPiTransformation.append(rbPi);

  let arduinoTransformation = new TransformationSGNode(glm.transform({translate: [-2.6, 0.90, -0.7], scale: [.1, .1, .1]}));

  let arduino = new MaterialSGNode([
    new RenderSGNode(resources.arduino)
  ]);
  root.append(arduinoTransformation);
  arduinoTransformation.append(arduino);
  
  //animations

  arm4AnimationPickUp = new Animation(arm4RotationTransformation,
      [{matrix: progress => mat4.rotateZ(mat4.create(), glm.translate(arm4Pos[0], arm4Pos[1], arm4Pos[2]), glm.deg2rad(progress * -16.3)), duration: 2000},
                {matrix: progress => mat4.rotateZ(mat4.create(), mat4.rotateZ(mat4.create(), glm.translate(arm4Pos[0], arm4Pos[1], arm4Pos[2]), glm.deg2rad(-16.3)), glm.deg2rad(progress * 16.3)), duration: 2000}],
      false);
  
  
  totalArmRotationAnimation = new Animation(armScaleTransformNode,
      [{matrix: progress => mat4.rotateY(mat4.create(), glm.transform({translate: [0, 0.5, 0], rotateY: 180, scale: 0.30}), glm.deg2rad(progress * -90)), duration:4000}], false);

  arm4AnimationPutDown = new Animation(arm4RotationTransformation,
      [{matrix: progress => mat4.rotateZ(mat4.create(), glm.translate(arm4Pos[0], arm4Pos[1], arm4Pos[2]), glm.deg2rad(progress * -16.3)), duration: 2000},
                {matrix: progress => mat4.rotateZ(mat4.create(), mat4.rotateZ(mat4.create(), glm.translate(arm4Pos[0], arm4Pos[1], arm4Pos[2]), glm.deg2rad(-16.3)), glm.deg2rad(progress * 16.3)), duration: 2000}],
      false);
  
  arm4AnimationPickUp.start();
  totalArmRotationAnimation.start();
  arm4AnimationPutDown.start();
  
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
  
  arm4AnimationPickUp.update(deltaTime);
  
  if(!arm4AnimationPickUp.running) {
    totalArmRotationAnimation.update(deltaTime);
  }
  if(!arm4AnimationPickUp.running && !totalArmRotationAnimation.running) {
    arm4AnimationPutDown.update(deltaTime);
  }
  

  //update animation BEFORE camera
  //cameraAnimation.update(deltaTime);
  camera.update(deltaTime);
  camera.control.enabled = true;

  //At the end of the automatic flight, switch to manual control
  //if(!cameraAnimation.running && !camera.control.enabled) {
  //  camera.control.enabled = true;
  //}

  //TODO use your own scene for rendering

  //Apply camera
  camera.render(context);

  //Render scene
  root.render(context);

  //request another call as soon as possible
  requestAnimationFrame(render);

  
  animatedAngle = timeInMilliseconds/10;
}

