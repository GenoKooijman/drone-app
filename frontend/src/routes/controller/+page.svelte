<script>
  import { socket } from "$lib/socket";
  import { onMount } from "svelte";

  let powerOn = false;
  let leftStickPosition = { x: 0, y: 0 };
  let rightStickPosition = { x: 0, y: 0 };
  let leftInterval = null;
  let rightInterval = null;

  const emitMove = (direction, speed = 1) => {
    if (powerOn) {
      socket.emit("move", { direction, speed });
    }
  };

  const togglePower = () => {
    powerOn = !powerOn;
    socket.emit("power", { state: powerOn });

    if (!powerOn) {
      clearInterval(leftInterval);
      clearInterval(rightInterval);
    }
  };

  const handleStickMove = (stick, dx, dy) => {
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 75;
    const angle = Math.atan2(dy, dx);
    const limitedDistance = Math.min(distance, maxDistance);
    const limitedDx = Math.cos(angle) * limitedDistance;
    const limitedDy = Math.sin(angle) * limitedDistance;

    if (stick === "left") {
      leftStickPosition = { x: limitedDx, y: limitedDy };
    } else if (stick === "right") {
      rightStickPosition = { x: limitedDx, y: limitedDy };
    }
  };

  const sendStickMovement = (stick, dx, dy) => {
    const speed = Math.min(Math.sqrt(dx * dx + dy * dy) / 75, 1);
    if (stick === "left") {
      if (dy < -10) emitMove("up", speed);
      else if (dy > 10) emitMove("down", speed);
      if (dx < -10) emitMove("rotateLeft", speed);
      else if (dx > 10) emitMove("rotateRight", speed);
    } else if (stick === "right") {
      if (dy < -10) emitMove("forward", speed);
      else if (dy > 10) emitMove("backward", speed);
      if (dx < -10) emitMove("left", speed);
      else if (dx > 10) emitMove("right", speed);
    }
  };

  const setupStick = (stickId, stickName) => {
    const stick = document.getElementById(stickId);
    let dragging = false;
    let startX, startY;

    stick.addEventListener("mousedown", (e) => {
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;

      if (stickName === "left") {
        leftInterval = setInterval(() => sendStickMovement("left", leftStickPosition.x, leftStickPosition.y), 100);
      } else {
        rightInterval = setInterval(() => sendStickMovement("right", rightStickPosition.x, rightStickPosition.y), 100);
      }
    });

    window.addEventListener("mousemove", (e) => {
      if (dragging) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        handleStickMove(stickName, dx, dy);
      }
    });

    window.addEventListener("mouseup", () => {
      dragging = false;
      if (stickName === "left") {
        leftStickPosition = { x: 0, y: 0 };
        clearInterval(leftInterval);
      } else {
        rightStickPosition = { x: 0, y: 0 };
        clearInterval(rightInterval);
      }
    });

    stick.addEventListener("touchstart", (e) => {
      dragging = true;
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;

      if (stickName === "left") {
        leftInterval = setInterval(() => sendStickMovement("left", leftStickPosition.x, leftStickPosition.y), 100);
      } else {
        rightInterval = setInterval(() => sendStickMovement("right", rightStickPosition.x, rightStickPosition.y), 100);
      }
    });

    stick.addEventListener("touchmove", (e) => {
      if (dragging) {
        const touch = e.touches[0];
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        handleStickMove(stickName, dx, dy);
      }
    });

    stick.addEventListener("touchend", () => {
      dragging = false;
      if (stickName === "left") {
        leftStickPosition = { x: 0, y: 0 };
        clearInterval(leftInterval);
      } else {
        rightStickPosition = { x: 0, y: 0 };
        clearInterval(rightInterval);
      }
    });
  };

  onMount(() => {
    setupStick("left-stick", "left");
    setupStick("right-stick", "right");
  });

  socket.on("connect", () => console.log("Socket connected"));
  socket.on("disconnect", () => console.log("Socket disconnected"));
</script>

<style>
  .controller {
    display: flex;
    justify-content: center;
    gap: 100px;
    margin-top: 50px;
  }

  .stick {
    width: 150px;
    height: 150px;
    background: #333;
    border-radius: 50%;
    position: relative;
    cursor: grab;
    user-select: none;
    touch-action: none;
  }

  .stick::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 40px;
    height: 40px;
    background: #ccc;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  button {
    margin-top: 20px;
    font-size: 1.2rem;
    padding: 10px 20px;
  }
</style>

<div>
  <button on:click={togglePower}>Power {powerOn ? "Off" : "On"}</button>

  <div class="controller">
    <div id="left-stick" class="stick" title="Left Stick (Throttle / Yaw)">
      <div
        class="stick-knob"
        style="left: calc(50% + {leftStickPosition.x}px); top: calc(50% + {leftStickPosition.y}px);"
      ></div>
    </div>
    <div id="right-stick" class="stick" title="Right Stick (Pitch / Roll)">
      <div
        class="stick-knob"
        style="left: calc(50% + {rightStickPosition.x}px); top: calc(50% + {rightStickPosition.y}px);"
      ></div>
    </div>
  </div>
</div>



