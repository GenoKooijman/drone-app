<script>
    import { socket } from "$lib/socket";
  
    let interval;
    let powerOn = false;
  
    const startMoving = (direction) => {
      clearInterval(interval);
  
      moveDrone(direction);
  
      // Set up an interval to repeatedly emit the move event
      interval = setInterval(() => {
        moveDrone(direction);
      }, 100); 
    };
  
    const stopMoving = () => {
      clearInterval(interval);
    };
  
    const moveDrone = (direction) => {
      console.log(`Emitting move event: ${direction}`);
      socket.emit("move", { direction });
    };
  
    const togglePower = () => {
      powerOn = !powerOn;
      if (powerOn) {
        startMoving("powerOn");
      } else {
        startMoving("powerOff");
      }
      return powerOn;
    };
  
    socket.on("connect", () => {
      console.log("Socket connected");
    });
  
    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
</script>
  
<div>
    <button on:click={togglePower}>Power {powerOn ? "On" : "Off"}</button>
    
    <button
      on:mousedown={() => startMoving("up")}
      on:mouseup={stopMoving}
      on:mouseleave={stopMoving}
      disabled={!powerOn}>Up</button
    >
    <button
      on:mousedown={() => startMoving("down")}
      on:mouseup={stopMoving}
      on:mouseleave={stopMoving}
      disabled={!powerOn}>Down</button
    >
    <button
      on:mousedown={() => startMoving("left")}
      on:mouseup={stopMoving}
      on:mouseleave={stopMoving}
      disabled={!powerOn}>Rotate Left</button
    >
    <button
      on:mousedown={() => startMoving("right")}
      on:mouseup={stopMoving}
      on:mouseleave={stopMoving}
      disabled={!powerOn}>Rotate Right</button
    >
    <button
      on:mousedown={() => startMoving("forward")}
      on:mouseup={stopMoving}
      on:mouseleave={stopMoving}
      disabled={!powerOn}>Forward</button
    >
    <button
      on:mousedown={() => startMoving("backward")}
      on:mouseup={stopMoving}
      on:mouseleave={stopMoving}
      disabled={!powerOn}>Backward</button
    >
</div>
