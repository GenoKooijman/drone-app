<script>
    import { socket } from "$lib/socket";
    // import '../app.css';

    let interval;

    const startMoving = (direction) => {
        moveDrone(direction);
        interval = setInterval(() => moveDrone(direction), 100);
    };

    const stopMoving = () => {
        clearInterval(interval);
    };

    const moveDrone = (direction) => {
        console.log(`Emitting move event: ${direction}`); // Debug log
        socket.emit("move", { direction });
    };

    socket.on("connect", () => {
        console.log("Socket connected");
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected");
    });
</script>

<div>
    <button on:mousedown={() => startMoving("up")} on:mouseup={stopMoving} on:mouseleave={stopMoving}>Up</button>
    <button on:mousedown={() => startMoving("down")} on:mouseup={stopMoving} on:mouseleave={stopMoving}>Down</button>
    <button on:mousedown={() => startMoving("left")} on:mouseup={stopMoving} on:mouseleave={stopMoving}>Rotate Left</button>
    <button on:mousedown={() => startMoving("right")} on:mouseup={stopMoving} on:mouseleave={stopMoving}>Rotate Right</button>
    <button on:mousedown={() => startMoving("forward")} on:mouseup={stopMoving} on:mouseleave={stopMoving}>Forward</button>
    <button on:mousedown={() => startMoving("backward")} on:mouseup={stopMoving} on:mouseleave={stopMoving}>Backward</button>
</div>