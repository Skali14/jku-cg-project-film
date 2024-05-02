[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/VLeXbpks)
# CG Lab Project

Submission template for the CG lab project at the Johannes Kepler University Linz.

### Explanation

This `README.md` needs to be pushed to Github for each of the four assignments. For every submission change/extend the corresponding sections by replacing the *TODO* markers. Make sure that you push everything to your Github repository before the respective deadlines. For more details, see the Moodle page.

### Student information due on 25.03.2024

|                  | Student ID | First Name | Last Name | E-Mail |
| ---------------- | ---------- | ---------- | --------- | ------ |
| **Student name** | k12222898  |   Simon    |  Kadlec   | simon.kadlec@outlook.de |

### Concept Submission due on 25.03.2024

I'm planning to create a movie featuring a scene where a robotic arm assembles various components on an assembly table.
There will be a cupboard or a table, where multiple of the required items are stored. The robotic arm will retrieve the items from there
and put them onto the assembly table. In a different scene there will be a closeup of the assembling table, where the robotic arm will be shown, 
welding some items together. This process will likely be represented by red particles erupting from the items. In the third scene, the robotic arm
will take the welded items and put them onto a conveyor belt, where they will be transported away. The robotic arm has a light source attached, 
which will serve as the moving light source in the movie. The background will be set in an industrial-looking room.

## Assignment 1 - Scene Graphs (Submission due on 15.04.2024)

Prepare a submission that contains:

* A1.1: Manually composed object 
* A1.2: Animate composed object 

Push your code on the day of the submission deadline.
The repository needs to contain:

* code/ documented code + resources + libs
* video/screen recording 

## Assignment 2 - Shading & Materials (Submission due on 02.05.2024)

Prepare a submission that contains:

* A 2.1: Materials 
* A 2.2: Multiple light sources 
* A 2.3: Phong shading
* A 2.4: Spotlight 

Push your code on the day of the submission deadline.
The repository needs to contain:

* code/ documented code + resources + libs
* video/screen recording 

## Assignment 3 - Animation (Submission due on 22.05.2024)

Prepare a submission that contains:

* A 3.1: Animate the camera for exactly 20 seconds
* A 3.2: Animated Light

Push your code on the day of the submission deadline.
The repository needs to contain:

* code/ documented code + resources + libs
* video/screen recording 

## Assignment 4 - Texturing (Submission due on 10.06.2024)

Prepare a submission that contains:

* A 4.1: Texture composed object 
* A 4.2: Shadow mapping OR cube mapping 

Push your code on the day of the submission deadline.

The repository needs to contain:

* code/ documented code + resources + libs
* video/screen recording 

### Assignments

You will implement the assignments in the table below. Replace yes/no/partial with one of the options each time you made a submission.
Mention in the comments column of the table where you have implemented the code and where it is visible (e.g., spotlight is the lamp post shining on the street).


| Implemented   | ID  | Name                                                                                    | Max. Points | Issues/Comments*                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------- | --- | --------------------------------------------------------------------------------------- | ----------- |--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| yes | 1.1 | Scene Graphs - Manually composed object.                                                | 10          | Implemented in the createSceneGraph() function, using models defined in loadResources. The manually composed object is the robotic arm in the middle of the scene which is composed of the models: base, arm1 - arm7 and gripper.                                                                                                                                                                                                                                  |
| yes | 1.2 | Scene Graphs - Animate parts of composed object and move it.                            | 7           | Implemented in the "animations" file, using initAnimations() to define the animations and start them, and calling startAnimations() in the render() function to update the animations according to deltaTime. The robotic arm rotates around its own axis, and rotates the model "arm4", which then according to the scene graph moves all models: arm5, arm6, arm7 and gripper, and also the models rbPi and arduino as long as they are attached to the gripper. |
| yes | 2.1 | Materials - Add at least 2 different materials to various parts of the composed object. | 6           | Obsidian-like material for base, silver-like  material for first three parts of robot, tin-like material for the next 4 parts of the robot and turquoise material for the gripper at the front                                                                                                                                                                                                                                                                     |
| yes | 2.2 | Lights - Use multiple light sources. Make sure all objects are affected by them. 		 | 7           | added 4 ceiling lights and 1 spotlight, see main.js                                                                                                                                                                                                                                                                                                                                                                                                                |
| yes | 2.3 | Shading & Materials - Apply Phong shading to all objects.                               | 7           | see main.js                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| yes | 2.4 | Lights - Implement one spotlight.                                                       | 13          | implemented spotlight in main.js and phong.fs.glsl added it via a spotlight object illuminating parts of the 2. table                                                                                                                                                                                                                                                                                                                                              |
| yes/no/partial | 3.1 | Animation - Animate camera for exactly 20 seconds.                                      | 14          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| yes/no/partial | 3.2 | Animation - Animated light - one light source should be moving in the scene.            | 8           |                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| yes/no/partial | 4.1 | Texturing - Texture parts of composed object / set tex coords.                          | 8           |                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| yes/no/partial | 4.2 | Advanced Texturing - Shadow Mapping or Cube Mapping.                                    | 20          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

* Mention in the comments column of the table where you have implemented the code for all minimal aspects/requirements and where it is visible (e.g., spotlight is the lamp post shining on the street).

### Credits

* "Construction Robot Arm" (https://skfb.ly/oFKo9) by lpoggie is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
* "Arduino UNO - Low Poly" (https://skfb.ly/onpXQ) by Yacoob is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
* "Welding and assembly table (lowpoly)" (https://skfb.ly/oovDw) by Zuckergelee is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
* "Cardboard Box" (https://skfb.ly/6R8LL) by Andrew.Mischenko is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
* "Raspberry Pi 3" (https://skfb.ly/OBDI) by JoSaCo is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
* "Circuit Board (Free Download)" (https://skfb.ly/onsoK) by Flikd Design is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
* "Simple rubber conveyor" (https://skfb.ly/6RUV9) by scailman is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
* "Simple Rails" (https://skfb.ly/6WOKG) by Equalent is licensed under CC Attribution-NonCommercial-ShareAlike (http://creativecommons.org/licenses/by-nc-sa/4.0/).
* "Spotlight" (https://skfb.ly/6XnBC) by JavierLinks is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).