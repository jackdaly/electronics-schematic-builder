import React, { useState, useEffect, useRef } from "react";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

const ComponentItem = ({ component, isDragged }) => {
  const [rotation, setRotation] = useState(0);
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: component.type,
    item: {
      id: component.id,
      type: component.type,
      rotation: 0,
      value: component.value,
      numberOfPorts: component.numberOfPorts,
    },
    // begin: () => onDragStart(),
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop()) {
        component.onDragEnd(component.id); // Notify Toolbar on drag end
      }
    },
  }));

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  // Style for the component container, which includes the white background
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: "relative",
    width: '50px', // Set width
    height: '50px', // Set height to the same as width to keep it square
    backgroundColor: isDragged ? "#F5F5F5" : "white", // Change background when dragged
    borderRadius: "20px",
    padding: "10px",
    margin: "5px",
    cursor: isDragged ? "default" : "grab",
    //display: "inline-block",
    boxShadow: isDragged ? `inset 0 0 0 4px #E5E5E5` : "none",
    userSelect: "none",
  };


  // Style for the image which will follow the cursor when dragged
  const imageStyle = {
    width: "50px",
    height: "50px",
    opacity: isDragging ? 0 : 1, // Hide the image in the original position when dragging
    userSelect: "none",
  };

  const imageUrl = `/assets/${component.type}.svg`; // Path to your SVG assets

  // Use a ref to store the drag source connector
  const dragRef = React.useRef(null);

  // Apply drag ref conditionally based on isDragged
  drag(isDragged ? null : dragRef);

  // Determine the unit based on the component type
  let displayValue = component.value;
  let unit = "";
  if (component.type === "battery") {
    unit = "V"; // Volts for battery
  } else if (component.type === "resistor") {
    unit = "\u2126"; // Ohm symbol (U+2126) for resistor
    if (component.value % 1000 === 0) {
      displayValue = component.value / 1000 + "k";
    }
  }

  return (
    <div style={containerStyle}>
      <div style={imageStyle}>
        {!isDragged && (
          <img
            ref={dragRef}
            src={`/assets/${component.type}.svg`}
            alt={component.name}
            width="50"
            height="50"
            style={{
              userSelect: "none",
              /* other styles */
            }}
          />
        )}
      </div>
      {/* Render component value with unit */}
      {!isDragged && (<div
        style={{
          marginTop: "20px", // Space of 20px below the image
          color: "#3EC0FF",
          fontSize: "12px",
          textAlign: "center",
          position: "absolute",
          bottom: "5px", // Positioned at the bottom of the container
        }}
      >
        {`${displayValue}${unit}`}
      </div>)}
      {/* ... other content */}
    </div>
  );
};

const Toolbar = ({ components, answerState, setAnswerState,AnswerMsg }) => {
  const [draggedComponents, setDraggedComponents] = useState({});

  const [isOverflowing, setIsOverflowing] = useState(false);
  const toolbarRef = useRef(null);

  console.log("AnswerMsg",AnswerMsg)

  useEffect(() => {
    if (toolbarRef.current) {
      const toolbarRect = toolbarRef.current.getBoundingClientRect();
      const toolbarWidth = toolbarRect.width; // Width including padding

      const totalComponentsWidth = components.reduce((total, component) => {
        // Assuming each component is 50px wide plus a 10px gap
        return total + 80; // 50px for component width and 10px for gap
      }, 0);

      // Subtract padding from total width to get content area width
      const contentAreaWidth = toolbarWidth - 20; // Assuming 10px padding on each side

      // Check if total width of components exceeds the content area width
      setIsOverflowing(totalComponentsWidth > contentAreaWidth);
    }
  }, [components]); // Recalculate when components array changes

  const handleDragEnd = (componentName) => {
    setDraggedComponents((prev) => ({ ...prev, [componentName]: true }));
  };

  // Define the styles for different answer states
  const toolbarStyle = () => {
    // Base styles that should always be applied
    let baseStyle = {
      width: "100%", // Set the desired width
      boxSizing: "border-box",
      minHeight: "70px",
      borderRadius: "20px", // Set the desired corner radius
      margin: "0 auto", // Center the toolbar
      display: "flex", // Using flex to align children
      justifyContent: isOverflowing ? "left" : "center", // Center children horizontally
      alignItems: "center", // Center children vertically
      padding: "10px", // Padding inside the toolbar
      gap: "10px", // Space between the items
      overflowX: isOverflowing ? "auto" : "hidden", // Enable horizontal scrolling
      whiteSpace: "nowrap",
    };

    // Append properties based on the answer state
    switch (answerState) {
      case "correct":
        return { ...baseStyle, backgroundColor: "#BAF190", color: "white" };
      case "incorrect":
        return { ...baseStyle, backgroundColor: "#FEC1C2", color: "white" };
      default:
        return { ...baseStyle, backgroundColor: "#F7F7F7", color: "white" };
    }
  };

  return (
    <div ref={toolbarRef} style={toolbarStyle()}>
      {/* Iterate over the components and render them */}
      {!answerState.length &&
        components.map((component, index) => (
          <ComponentItem
            key={component.id}
            component={{ ...component, onDragEnd: handleDragEnd }}
            isDragged={!!draggedComponents[component.id]}
            onDragEnd={() => handleDragEnd(component.id)}
          />
        ))}

      {/* Conditionally render the answer state message */}
      {answerState === "correct" && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src={`/assets/correctSymbol.svg`}
            alt="correctSymbol"
            style={{
              width: "50px",
              height: "50px",
              userSelect: "none",
            }}
          />
          <h3
            style={{
              color: "#5BA61C",
            }}
          >
            You’re correct!
          </h3>
        </div>
      )}
      {answerState === "incorrect" && (
       <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
       <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
         <img src={`/assets/incorrectSymbol.svg`} alt="Incorrect Symbol" style={{ width: "50px", height: "50px" }} />
         <h3 style={{ color: "#EA4448" }}>Incorrect.</h3>
       </div>
       <div style={{ fontSize: "14px", textAlign: "center", color: "#EA4448" }}>
       {AnswerMsg[0].reason}
       </div>
     </div>
      )}
    </div>
  );
};

export default Toolbar;
