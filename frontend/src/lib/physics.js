import * as THREE from "three";

let velocity = new THREE.Vector3(0, 0, 0);
let acceleration = new THREE.Vector3(0, 0, 0);
let friction = 0.99;
let gravity = new THREE.Vector3(0, -0.005, 0);
let damping = 0.98;

let powerOn = false;
let throttleNeutral = true;

const groundY = 0;
const droneHalfHeight = 0.25;

export function applyPhysics(drone) {
  if (!drone) return;

  velocity.add(gravity);

  if (powerOn && velocity.y < 0) {
    velocity.y += 0.002;
  }

  velocity.add(acceleration);
  velocity.multiplyScalar(friction);
  velocity.multiplyScalar(damping);

  const nextPosition = new THREE.Vector3().addVectors(drone.position, velocity);
  const nextBottomY = nextPosition.y - droneHalfHeight;

  if (nextBottomY <= groundY) {
    nextPosition.y = groundY + droneHalfHeight;
    velocity.y = 0;
  }

  drone.position.lerp(nextPosition, 0.1);

  const targetRotation = new THREE.Quaternion().setFromEuler(drone.rotation);
  drone.quaternion.slerp(targetRotation, 0.1);

  acceleration.set(0, 0, 0);
  throttleNeutral = true;
}

export function moveDrone(drone, direction, speed = 1) {
  if (!drone) return;

  const baseForce = 0.16;
  const force = baseForce * speed;
  const rotationSpeed = 0.05 * speed;

  if (direction === "powerOn") {
    powerOn = true;
  }

  if (direction === "powerOff") {
    powerOn = false;
  }

  if (direction === "up") {
    acceleration.y += force;
    throttleNeutral = false;
  } else if (direction === "down") {
    acceleration.y -= force;
    throttleNeutral = false;
  }

  if (direction === "left" || direction === "right") {
    const quaternion = new THREE.Quaternion();
    const axis = new THREE.Vector3(0, 1, 0);
    const angle = direction === "left" ? rotationSpeed : -rotationSpeed;
    quaternion.setFromAxisAngle(axis, angle);
    drone.quaternion.multiplyQuaternions(quaternion, drone.quaternion);
  }

  if (direction === "forward" || direction === "backward") {
    const movement = new THREE.Vector3();
    drone.getWorldDirection(movement);
    acceleration.addScaledVector(movement, direction === "forward" ? force : -force);
  }
}



  