import * as THREE from "three";

let velocity = new THREE.Vector3(0, 0, 0);
let acceleration = new THREE.Vector3(0, 0, 0);
let friction = 0.99;
let gravity = new THREE.Vector3(0, -0.002, 0);
let damping = 0.98;

let powerOn = false;

const groundY = 0;
const droneHalfHeight = 0.25; // From BoxGeometry height = 0.5

export function applyPhysics(drone) {
  if (!drone) return;

  // Apply gravity
  velocity.add(gravity);

  // apply floating if power on
  if (powerOn && velocity.y < 0) {
    velocity.y += 0.002;
  }

  // Apply acceleration
  velocity.add(acceleration);

  velocity.multiplyScalar(friction);
  velocity.multiplyScalar(damping);

  // Predict next position
  const nextPosition = new THREE.Vector3().addVectors(drone.position, velocity);

  // Ground collision check
  const nextBottomY = nextPosition.y - droneHalfHeight;
  if (nextBottomY <= groundY) {
    // Snap to ground
    nextPosition.y = groundY + droneHalfHeight;
    velocity.y = 0;
  }

  // Smooth
  drone.position.lerp(nextPosition, 0.1);

  const targetRotation = new THREE.Quaternion().setFromEuler(drone.rotation);
  drone.quaternion.slerp(targetRotation, 0.1);

  // Reset accel
  acceleration.set(0, 0, 0);
}

export function moveDrone(drone, direction) {
  if (!drone) return;

  const force = 0.1; 
  const rotationSpeed = 0.05;

  if (direction === "powerOn") {
    powerOn = true; 
  }
  if (direction === "powerOff") {
    powerOn = false; 
  }

  if (direction === "up") acceleration.y += force;
  if (direction === "down") acceleration.y -= force;

  if (direction === "left" || direction === "right") {
    const quaternion = new THREE.Quaternion();
    const axis = new THREE.Vector3(0, 1, 0); // Rotate Y
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

  