<script>
    import { socket } from "$lib/socket";

    const moveDrone = (direction) => {
        socket.emit("move", { direction });
    };
</script>

<div>
    <button on:click={() => moveDrone("up")}>Up</button>
    <button on:click={() => moveDrone("down")}>Down</button>
    <button on:click={() => moveDrone("left")}>Left</button>
    <button on:click={() => moveDrone("right")}>Right</button>
</div>
    