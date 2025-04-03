import * as THREE from "three";

let velocity = new THREE.Vector3(0, 0, 0);
let acceleration = new THREE.Vector3(0, 0, 0);
let friction = 0.99; // Increased friction for better control
let gravity = new THREE.Vector3(0, -0.002, 0); // Simulated gravity
let damping = 0.98; // Increased damping for smoother movement

export function applyPhysics(drone) {
  if (!drone) return;

  // Apply gravity
  velocity.add(gravity);

  // Counteract gravity to make the drone float
  if (velocity.y < 0) {
    velocity.y += 0.002; // Adjust this value to fine-tune the floating effect
  }

  // Apply acceleration to velocity
  velocity.add(acceleration);

  // Apply friction
  velocity.multiplyScalar(friction);

  // Apply damping for smoother movement
  velocity.multiplyScalar(damping);

  // Smoothly interpolate the drone's position
  const targetPosition = new THREE.Vector3().addVectors(drone.position, velocity);
  drone.position.lerp(targetPosition, 0.1); // Use lerp for smooth position updates

  // Smoothly interpolate the drone's rotation
  const targetRotation = new THREE.Quaternion().setFromEuler(drone.rotation);
  drone.quaternion.slerp(targetRotation, 0.1); // Use slerp for smooth rotation updates

  // Reset acceleration
  acceleration.set(0, 0, 0);
}

export function moveDrone(drone, direction) {
  if (!drone) return;

  const force = 0.1; // Increased movement force for faster movement
  const rotationSpeed = 0.1; // Increased rotation speed

  if (direction === "up") acceleration.y += force;
  if (direction === "down") acceleration.y -= force;
  if (direction === "left") drone.rotation.y += rotationSpeed;
  if (direction === "right") drone.rotation.y -= rotationSpeed;

  if (direction === "forward" || direction === "backward") {
    const movement = new THREE.Vector3();
    drone.getWorldDirection(movement);
    acceleration.addScaledVector(movement, direction === "forward" ? force : -force);
  }
}

  