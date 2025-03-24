<script>
  import { onMount } from "svelte";
  import { socket } from "$lib/socket";
  import * as THREE from "three";

  let scene, camera, renderer, drone, light;

  onMount(() => {
    const init = () => {
      scene = new THREE.Scene();

      // Lighting
      light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(10, 10, 10);
      scene.add(light);
      scene.add(new THREE.AmbientLight(0x404040));

      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);

      // drone body
      const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 2);
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555,
        metalness: 0.6,
        roughness: 0.4,
      });
      drone = new THREE.Mesh(bodyGeometry, bodyMaterial);
      scene.add(drone);

      //Propellers
      function createPropeller() {
        const propellerGroup = new THREE.Group();

        // shaft
        const shaftGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.2);
        const shaftMaterial = new THREE.MeshStandardMaterial({
          color: 0x333333,
        });
        const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
        shaft.rotation.x = Math.PI / 2;
        propellerGroup.add(shaft);

        // blades
        const bladeGeometry = new THREE.BoxGeometry(0.8, 0.02, 0.1);
        const bladeMaterial = new THREE.MeshStandardMaterial({
          color: 0xaaaaaa,
          metalness: 0.8,
          roughness: 0.4,
        });
        const blades = [];
        for (let i = 0; i < 2; i++) {
          const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
          blade.rotation.z = (Math.PI / 2) * i;
          blade.position.set(0, 0, 0);
          blades.push(blade);
          propellerGroup.add(blade);
        }

        // Cylinder around
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

      // four propellers and position on drone
      const propellers = [];
      const positions = [
        [1, 0.25, 1],
        [-1, 0.25, 1],
        [1, 0.25, -1],
        [-1, 0.25, -1],
      ];

      for (const pos of positions) {
        const propeller = createPropeller();
        propeller.position.set(pos[0], pos[1], pos[2]);
        propeller.rotation.x = Math.PI / 2;
        drone.add(propeller);
        propellers.push(propeller);
      }

      // Position the camera
      camera.position.set(0, 3, -10);

      // grid
      const gridHelper = new THREE.GridHelper(200, 50);
      scene.add(gridHelper);

      // walls
      const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555,
        side: THREE.DoubleSide,
      });
      const wall1 = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 50),
        wallMaterial
      );
      wall1.position.set(0, 25, -100);
      scene.add(wall1);

      const wall2 = wall1.clone();
      wall2.position.set(0, 25, 100);
      wall2.rotation.y = Math.PI;
      scene.add(wall2);

      const wall3 = wall1.clone();
      wall3.position.set(-100, 25, 0);
      wall3.rotation.y = Math.PI / 2;
      scene.add(wall3);

      const wall4 = wall3.clone();
      wall4.position.set(100, 25, 0);
      wall4.rotation.y = -Math.PI / 2;
      scene.add(wall4);

      // Ground mats
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshStandardMaterial({
          color: 0x808080,
          metalness: 0.2,
          roughness: 0.8,
        })
      );
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);

      // Skybox
      const skyboxGeometry = new THREE.SphereGeometry(1000, 32, 32);
      const skyboxMaterial = new THREE.MeshBasicMaterial({
        color: 0x87ceeb,
        side: THREE.BackSide,
      });
      const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
      scene.add(skybox);
    };

    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate propellors
      drone.children.forEach((propeller) => {
        propeller.rotation.z += 0.1; // speed
      });

      // follow behind cam
      const offset = new THREE.Vector3(0, 2, -5);
      const droneWorldPosition = new THREE.Vector3();
      drone.getWorldPosition(droneWorldPosition);
      camera.position.lerp(
        droneWorldPosition
          .clone()
          .add(offset.applyQuaternion(drone.quaternion)),
        0.1
      );
      camera.lookAt(droneWorldPosition);

      renderer.render(scene, camera);
    };

    init();
    animate();

    socket.on("updateDrone", (data) => {
      if (data.direction === "up") drone.position.y += 0.1;
      if (data.direction === "down") drone.position.y -= 0.1;
      if (data.direction === "left") drone.rotation.y += 0.1;
      if (data.direction === "right") drone.rotation.y -= 0.1;

      if (data.direction === "forward" || data.direction === "backward") {
        const direction = new THREE.Vector3();
        drone.getWorldDirection(direction);
        drone.position.addScaledVector(
          direction,
          data.direction === "forward" ? 0.5 : -0.5
        );
      }
    });
  });
</script>
