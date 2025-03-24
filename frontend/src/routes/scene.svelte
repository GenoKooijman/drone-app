<script>
    import { onMount } from "svelte";
    import { socket } from "$lib/socket";
    import * as THREE from "three";

    let scene, camera, renderer, drone;

    onMount(() => {
        const init = () => {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);

            drone = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshBasicMaterial({ color: 0x00ff00 })
            );
            scene.add(drone);

            camera.position.z = 5;
        };

        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };

        init();
        animate();

        socket.on("updateDrone", (data) => {
            if (data.direction === "up") drone.position.y += 0.1;
            if (data.direction === "down") drone.position.y -= 0.1;
            if (data.direction === "left") drone.position.x -= 0.1;
            if (data.direction === "right") drone.position.x += 0.1;
        });
    });
</script>
    