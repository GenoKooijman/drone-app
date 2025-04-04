<script>
  import { onMount } from "svelte";
  import { socket } from "$lib/socket";
  import * as THREE from "three";
  import { moveDrone, applyPhysics } from "$lib/physics.js"; 

  let scene, camera, renderer, drone, light;

  onMount(() => {
    if (document.querySelector("canvas")) {
      document.querySelector("canvas").remove(); 
    }

    const init = () => {
      scene = new THREE.Scene();

      // Lighting
      light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(10, 10, 10);
      scene.add(light);
      scene.add(new THREE.AmbientLight(0x404040));

      // Adjust camera FOV to make the scene wider
      camera = new THREE.PerspectiveCamera(
        90, // Increased from 75 to 90 for a wider view
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);

      // Ensure only one drone exists
      if (!drone) {
        // Drone body
        const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 2);
        const bodyMaterial = new THREE.MeshStandardMaterial({
          color: 0x555555,
          metalness: 0.6,
          roughness: 0.4,
        });
        drone = new THREE.Mesh(bodyGeometry, bodyMaterial);
        scene.add(drone);

        // Propellers
        function createPropeller() {
          const propellerGroup = new THREE.Group();

          // Shaft
          const shaftGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.2);
          const shaftMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
          const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
          shaft.rotation.x = Math.PI / 2;
          propellerGroup.add(shaft);

          // Blades
          const bladeGeometry = new THREE.BoxGeometry(0.8, 0.02, 0.1);
          const bladeMaterial = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            metalness: 0.8,
            roughness: 0.4,
          });

          for (let i = 0; i < 2; i++) {
            const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
            blade.rotation.z = (Math.PI / 2) * i;
            propellerGroup.add(blade);
          }

          // Cylinder around blades
          const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);
          const cylinderMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.6,
            roughness: 0.4,
            opacity: 0.5,
            transparent: true,
          });
          const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
          cylinder.rotation.x = Math.PI / 2;
          propellerGroup.add(cylinder);

          return propellerGroup;
        }

        // Four propellers positioned on drone
        const positions = [
          [1, 0.25, 1],
          [-1, 0.25, 1],
          [1, 0.25, -1],
          [-1, 0.25, -1],
        ];

        positions.forEach((pos) => {
          const propeller = createPropeller();
          propeller.position.set(pos[0], pos[1], pos[2]);
          propeller.rotation.x = Math.PI / 2;
          drone.add(propeller);
        });
      }

      // Position the camera
      camera.position.set(0, 3, -10);

      // Grid - Increase size for a wider scene
      const gridHelper = new THREE.GridHelper(400, 100); // Increased size from 200, 50
      scene.add(gridHelper);

      // Walls
      const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x555555, side: THREE.DoubleSide });

      const createWall = (x, y, z, rotY = 0) => {
        const wall = new THREE.Mesh(new THREE.PlaneGeometry(400, 50), wallMaterial); // Increased width from 200 to 400
        wall.position.set(x, y, z);
        wall.rotation.y = rotY;
        scene.add(wall);
      };

      createWall(0, 25, -200); // Adjusted position for wider walls
      createWall(0, 25, 200, Math.PI);
      createWall(-200, 25, 0, Math.PI / 2);
      createWall(200, 25, 0, -Math.PI / 2);

      // Ground
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(400, 400), // Increased size from 200x200 to 400x400
        new THREE.MeshStandardMaterial({ color: 0x808080, metalness: 0.2, roughness: 0.8 })
      );
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);

      // Skybox
      const skyboxGeometry = new THREE.SphereGeometry(1000, 32, 32);
      const skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0x87ceeb, side: THREE.BackSide });
      const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
      scene.add(skybox);
    };

    const animate = () => {
      requestAnimationFrame(animate);

      applyPhysics(drone);

      // Rotate propellers
      drone.children.forEach((propeller) => {
        propeller.rotation.z += 0.1;
      });

      // Smooth camera follow
      const offset = new THREE.Vector3(0, 2, -5);
      const droneWorldPosition = new THREE.Vector3();
      drone.getWorldPosition(droneWorldPosition);
      camera.position.lerp(
        droneWorldPosition.clone().add(offset.applyQuaternion(drone.quaternion)),
        0.1
      );
      camera.lookAt(droneWorldPosition);

      renderer.render(scene, camera);
    };

    init();
    animate();

    socket.on("updateDrone", (data) => {
      moveDrone(drone, data.direction);
    });
  });
</script>


