let moveRobotToSceneAnimation;

let totalArmRotationAnimation1;
let totalArmRotationAnimation2;
let totalArmRotationAnimation3;

let armPutDownAnimation1;
let armPutDownAnimation2;
let armPutDownAnimation3;
let armPutDownAnimation4;

let armPickUpAnimation1;
let armPickUpAnimation2;
let armPickUpAnimation3;
let armPickUpAnimation4;

let moveConveyorBeltAnimation;

//variable to determine which step of the animation is currently running
var step  = 0;

//defining all necessary animations and setting them to "running"
function initAnimations() {
    
    //moving whole robot on rails to center of scene
    moveRobotToSceneAnimation = new Animation(totalArmTransformNode,
        [{
            matrix: mat4.multiply(mat4.create(), mat4.multiply(mat4.create(), mat4.create(), glm.transform({
                translate: [0, 0, 0],
                rotateY: 180,
                scale: 0.30
            })), glm.translate(0, 0, 0)), duration: 2250
        }
        ], false);

    //lowering front arm of robot to pick up rbPi
    armPutDownAnimation1 = armPutDownAnimation();
    
    //raising front arm of robot with attached rbPi
    armPickUpAnimation1 = armPickUpAnimation();

    //rotating whole arm by 75 degrees to reach the spot to put rbPi back down
    totalArmRotationAnimation1 = new Animation(totalArmTransformNode,
        [{
            matrix: progress => mat4.rotateY(mat4.create(), glm.transform({
                translate: [0, 0, 0],
                rotateY: 180,
                scale: 0.30
            }), glm.deg2rad(progress * -75)), duration: 2250
        }], false);

    //lowering front arm of robot to put rbPi back down
    armPutDownAnimation2 = armPutDownAnimation();
    
    //raising front arm of robot after putting down rbPi
    armPickUpAnimation2 = armPickUpAnimation();

    //rotating whole arm by 30 degrees to reach the spot to pick up the arduino
    totalArmRotationAnimation2 = new Animation(totalArmTransformNode,
        [{
            matrix: progress => mat4.rotateY(mat4.create(), mat4.multiply(mat4.create(), glm.transform({
                translate: [0, 0, 0],
                rotateY: 180,
                scale: 0.30
            }), glm.rotateY(-75)), glm.deg2rad(progress * -30)), duration: 900
        }], false);

    //lowering front arm of robot to pick up arduino
    armPutDownAnimation3 = armPutDownAnimation();

    //raising front arm of robot with attached arduino
    armPickUpAnimation3 = armPickUpAnimation();

    //rotating whole arm by 75 degrees to reach the spot to put arduino back down
    totalArmRotationAnimation3 = new Animation(totalArmTransformNode,
        [{
            matrix: progress => mat4.rotateY(mat4.create(), mat4.multiply(mat4.create(), glm.transform({
                translate: [0, 0, 0],
                rotateY: 180,
                scale: 0.30
            }), glm.rotateY(-105)), glm.deg2rad(progress * -75)), duration: 2250
        }], false);

    //lowering front arm of robot to put arduino back down
    armPutDownAnimation4 = armPutDownAnimation();

    //raising front arm of robot after putting down arduino
    armPickUpAnimation4 = armPickUpAnimation();

    
    //moving the arduino by 25 on the conveyor belt, then moving it diagonally into the box
    moveConveyorBeltAnimation = new Animation(arduinoTransformation,
        [{
            matrix: progress => mat4.multiply(mat4.create(), mat4.multiply(mat4.create(), mat4.create(), glm.transform({
                translate: [2.57, 0.94, 0],
                scale: [.1, .1, .1]
            })), glm.translate(progress * 20, 0, 0)), duration: 2666
        },
            {
                matrix: progress => mat4.multiply(mat4.create(), mat4.multiply(mat4.create(), mat4.multiply(mat4.create(), mat4.create(), glm.transform({
                    translate: [2.57, 0.94, 0],
                    scale: [.1, .1, .1]
                })), glm.translate(20, 0, 0)), glm.translate(progress * 2, progress * -8, 0)), duration: 1333
            }], false);

    //initializing all front arm animations, since they are always the same but need to be called differently for the logic in startAnimation() to work.
    function armPutDownAnimation() {
        return new Animation(arm4RotationTransformation,
            [{
                matrix: progress => mat4.rotateZ(mat4.create(), glm.translate(arm4Pos[0], arm4Pos[1], arm4Pos[2]), glm.deg2rad(progress * -15.5)),
                duration: 1200
            }],
            false);
    }

    //initializing all front arm animations, since they are always the same but need to be called differently for the logic in startAnimation() to work.
    function armPickUpAnimation() {
        return new Animation(arm4RotationTransformation,
            [{
                matrix: progress => mat4.rotateZ(mat4.create(), mat4.rotateZ(mat4.create(), glm.translate(arm4Pos[0], arm4Pos[1], arm4Pos[2]), glm.deg2rad(-15.5)), glm.deg2rad(progress * 15.5)),
                duration: 1200
            }],
            false);
    }
    
    //setting all necessary animations to "running"
    moveRobotToSceneAnimation.start();
    armPutDownAnimation1.start();
    armPickUpAnimation1.start();
    totalArmRotationAnimation1.start();
    armPutDownAnimation2.start();
    armPickUpAnimation2.start();
    totalArmRotationAnimation2.start();
    armPutDownAnimation3.start();
    armPickUpAnimation3.start();
    totalArmRotationAnimation3.start();
    armPutDownAnimation4.start();
    armPickUpAnimation4.start();
    moveConveyorBeltAnimation.start();

    return root;
}


function startAnimation(deltaTime) {
    switch (step) {
        case 0:
            moveRobotToSceneAnimation.update(deltaTime);
            if(!moveRobotToSceneAnimation.running) {
                step++;
            }
            break;
        case 1:
            armPutDownAnimation1.update(deltaTime);
            if(!armPutDownAnimation1.running) {
                step++;
                //attaching rbPi to the gripper
                root.remove(rbPiTransformation);
                gripperRotationTransformation.append(rbPiTransformation);
                rbPiTransformation.setMatrix(glm.transform({
                    translate: [0, -1, 0],
                    scale: [0.33, 0.33, 0.33]
                }));
            }
            break;
        case 2:
            armPickUpAnimation1.update(deltaTime);
            if(!armPickUpAnimation1.running) {
                step++;
            }
            break;
        case 3:
            totalArmRotationAnimation1.update(deltaTime);
            if(!totalArmRotationAnimation1.running) {
                step++;
            }
            break;
        case 4:
            armPutDownAnimation2.update(deltaTime);
            if(!armPutDownAnimation2.running) {
                step++;
                //detaching rbPi from the gripper
                gripperRotationTransformation.remove(rbPiTransformation);
                root.append(rbPiTransformation);
                rbPiTransformation.setMatrix(glm.transform({
                    translate: [-0.68, 0.94, -2.45],
                    scale: [.1, .1, .1],
                    rotateY:105,
                }));
            }
            break;
        case 5:
            armPickUpAnimation2.update(deltaTime);
            if(!armPickUpAnimation2.running) {
                step++;
            }
            break;
        case 6:
            totalArmRotationAnimation2.update(deltaTime);
            if(!totalArmRotationAnimation2.running) {
                step++;
            }
            break;
        case 7:
            armPutDownAnimation3.update(deltaTime);
            if(!armPutDownAnimation3.running) {
                step++;
                //attaching arduino to the gripper
                root.remove(arduinoTransformation);
                gripperRotationTransformation.append(arduinoTransformation);
                arduinoTransformation.setMatrix(glm.transform({
                    translate: [0, -1, 0],
                    scale: [0.33, 0.33, 0.33]
                }));
            }
            break;
        case 8:
            armPickUpAnimation3.update(deltaTime);
            if(!armPickUpAnimation3.running) {
                step++;
            }
            break;
        case 9:
            totalArmRotationAnimation3.update(deltaTime);
            if(!totalArmRotationAnimation3.running) {
                step++;
            }
            break;
        case 10:
            armPutDownAnimation4.update(deltaTime);
            if(!armPutDownAnimation4.running) {
                step++;
                //detaching rbPi from the gripper
                gripperRotationTransformation.remove(arduinoTransformation);
                root.append(arduinoTransformation);
                arduinoTransformation.setMatrix(glm.transform({
                    translate: [2.57, 0.94, 0],
                    scale: [.1, .1, .1]
                }));

            }
            break;
        case 11:
            armPickUpAnimation4.update(deltaTime);
            moveConveyorBeltAnimation.update(deltaTime);
            if(!moveConveyorBeltAnimation.running) {
                step++;
            }
            break;
    }
}