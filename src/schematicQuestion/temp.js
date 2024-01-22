


// Set up event listeners in useEffect
useEffect(() => {
    // Check if the device supports touch events
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    // const handleTouchMove = (e) => {
    //   e.preventDefault(); // Prevent scrolling when touching the grid
    //   addSegmentToLine(e);
    //   //updateLineToCursor(e);
    // };

    const gridElement = document.querySelector(".grid");
    console.log("Is touch device? ", isTouchDevice);
    if (isTouchDevice) {
      // Add touch event listeners for touch devices
      document.addEventListener("touchstart", handleTouchStart);
      document.addEventListener("touchend", handleTouchEnd);
      if (isDrawing) {
        console.log("Touch Add move event");
        document.addEventListener("touchmove", handleTouchMove);
      } else {
        console.log("Touch Removed move event");
        document.removeEventListener("touchmove", handleTouchMove);
      }
    } else {
      // Add mouse event listeners for non-touch devices
      gridElement.addEventListener("click", handleGridClick);
      gridElement.addEventListener("dblclick", handleDoubleClick);
      if (isDrawing) {
        document.addEventListener("mousemove", updateLineToCursor);
      } else {
        document.removeEventListener("mousemove", updateLineToCursor);
      }
    }

    // Cleanup event listeners on unmount
    return () => {
      if (isTouchDevice) {
        document.removeEventListener("touchstart", handleTouchStart);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      } else {
        document.removeEventListener("mousemove", updateLineToCursor);
        gridElement.removeEventListener("click", handleGridClick);
        gridElement.removeEventListener("dblclick", handleDoubleClick);
      }
    };
  }, [
    isDrawing,
    updateLineToCursor,
    handleGridClick,
    handleDoubleClick,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  ]);