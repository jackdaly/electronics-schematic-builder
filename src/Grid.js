import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDrop } from "react-dnd";

import { v4 as uuidv4 } from "uuid"; // Import UUID

const GridSize = 50;

const GridCell = ({ onDrop, x, y }) => {
  const [{ isOver, canDrop, item }, drop] = useDrop(() => ({
    accept: ["resistor", "battery", "meter"],
    drop: (item) => onDrop(item, x, y),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
      item: monitor.getItem(),
    }),
  }));

  const renderPreview = () => {
    if (isOver && canDrop && item) {
      const imageUrl = `/assets/${item.type}.svg`; // Path to your SVG assets
      // Adjust the styles to place the preview image on the grid line
      return (
        <img
          src={imageUrl}
          alt={`Preview of ${item.id}`}
          style={{
            width: "50px", // Match the grid cell width
            opacity: 0.5, // 50% opacity for preview
            position: "absolute",
            left: "0", // Align with the left edge of the cell
            bottom: "25px", // Align with the bottom edge of the cell
            pointerEvents: "none", // Ensures the image doesn't interfere with drop events
          }}
        />
      );
    }
    return null;
  };

  return (
    <div
      ref={drop}
      style={{
        width: `${GridSize}px`,
        height: `${GridSize}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        borderRight: "1px solid black",
        borderBottom: "1px solid black",
        backgroundColor: "transparent",
        position: "relative", // Needed for absolute positioning of children
      }}
    >
      {renderPreview()}
    </div>
  );
};

const Node = ({ componentId, nodeId, onNodeClick, x, y, degree,devMode }) => {
  // Adjust for the grid's offset and the node's size
  const nodex = x * GridSize + (nodeId === "input" ? 0 : 50);
  const nodey = y * GridSize;

  const nodeSize = 20;

  return (
    <div
      data-x={nodex}
      data-y={nodey}
      className="node"
      onClick={(e) => onNodeClick(e, componentId, nodeId, nodex, nodey)}
      style={{
        width: `${nodeSize}px`,
        height: `${nodeSize}px`,
        backgroundColor: devMode? "red" : "transparent",
        top: `${GridSize/2 - nodeSize/2}px`,
        left: nodeId === "input" ? `${-(nodeSize/2)}px` : `${GridSize-(nodeSize/2)}px`,
        transform: "rotate(" + degree + "deg)",
        position: "absolute",
        cursor: "pointer",
      }}
    />
  );
};

const Grid = ({ components, setComponents, devMode }) => {
  //const [components, setComponents] = useState([]);
  const [lines, setLines] = useState([]); // Store lines
  const [currentLine, setCurrentLine] = useState(null); // Currently drawn line
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(
    () => {
      console.log("Component re-rendered. Current state:", {
        currentLine,
        currentLineRef,
      });
    },
    [
      /* dependencies that when changed cause re-render */
    ]
  );

  const currentLineRef = useRef(null);
  console.log("Lines to render:", lines);

  const cellSize = 50;

  const snapToGrid = (x, y) => {
    const snappedX = Math.round(x / cellSize) * cellSize;
    const snappedY = Math.round(y / cellSize) * cellSize;
    return { snappedX, snappedY };
  };

  const calculateLShapedPath = (startX, startY, endX, endY) => {
    const { snappedX, snappedY } = snapToGrid(endX, endY);

    // Decide direction based on proximity
    const goHorizontalFirst =
      Math.abs(snappedX - startX) > Math.abs(snappedY - startY);

    if (goHorizontalFirst) {
      return [
        { x1: startX, y1: startY, x2: snappedX, y2: startY }, // Horizontal segment
        { x1: snappedX, y1: startY, x2: snappedX, y2: snappedY }, // Vertical segment
      ];
    } else {
      return [
        { x1: startX, y1: startY, x2: startX, y2: snappedY }, // Vertical segment
        { x1: startX, y1: snappedY, x2: snappedX, y2: snappedY }, // Horizontal segment
      ];
    }
  };

  //-----------------------

  useEffect(() => {
    // Synchronize ref with state
    currentLineRef.current = currentLine;
  }, [currentLine]);

  // Define event handlers using useCallback
  const updateLineToCursor = useCallback((e) => {
    console.log("updateLineToCursor");
    // Log the event or other relevant information before state update
    //console.log("Mouse event:", e);

    setCurrentLine((current) => {
      //console.log("Current state before update:", current);

      // Log the segments specifically to see if they are defined or empty
      //console.log("Current segments before update:", current?.segments);

      if (!current || !current.segments) {
        //console.log("No current line or segments are undefined/empty.");
        return current;
      }

      const gridRect = document.querySelector(".grid").getBoundingClientRect();
      const cursorX = e.clientX - gridRect.left;
      const cursorY = e.clientY - gridRect.top;

      const lShapedPath = calculateLShapedPath(
        current.x1,
        current.y1,
        cursorX,
        cursorY
      );

      console.log("lShapedPath", lShapedPath);

      const newState = {
        ...current,
        x2: cursorX,
        y2: cursorY,
        segments: lShapedPath,
      };
      console.log("newState", newState);
      //console.log("New state after update:", newState);
      return newState;
    });

    // This log will still show the 'currentLine' state before the update due to the async nature of setState
    //console.log("State after setCurrentLine call:", currentLine);
  }, []); // Add necessary dependencies

  const handleGridClick = useCallback((e) => {
    console.log("handleGridClick");

    // Ensure we're dealing with the grid and not a node
    if (!e.target.classList.contains("node")) {
      if (
        currentLineRef.current &&
        currentLineRef.current.segments.length > 0
      ) {
        // Save the current line's segments to the lines state
        console.log("currentLineRef", currentLineRef);
        setLines((prevLines) => [
          ...prevLines,
          {
            ...currentLineRef.current,
            segments: [...currentLineRef.current.segments],
          },
        ]);

        // Get the last segment's endpoint
        const lastSegment =
          currentLineRef.current.segments[
            currentLineRef.current.segments.length - 1
          ];
        const newStartX = lastSegment.x2;
        const newStartY = lastSegment.y2;

        // Prepare for a new line continuation from the last segment's endpoint
        const newLine = {
          ...currentLineRef.current,
          x1: newStartX,
          y1: newStartY,
          x2: newStartX,
          y2: newStartY,
        };

        // Set the new line as the current line
        setCurrentLine(newLine);
        currentLineRef.current = newLine;
      }
    }
  }, []); // Make sure to add necessary dependencies if you use any

  const handleDoubleClick = useCallback((e) => {
    // Clear the current line being drawn
    setCurrentLine(null);
    setIsDrawing(false);
    // Optionally, you can remove the mousemove event listener here if required
    // However, it's typically better to set up and tear down listeners in useEffect
  }, []);



  //--------------------------
  const handleNodeClick = (e, componentId, nodeId, x, y) => {
    console.log("handleNodeClick", {
      componentId,
      nodeId,
      currentLineRef: currentLineRef.current,
    });
    //Should return position of node (not adjusted for offset)
    const pixelX = parseInt(e.target.dataset.x, 10);
    const pixelY = parseInt(e.target.dataset.y, 10);

    if (!currentLineRef.current) {
      // Start the line
      console.log("Start of line");

      setIsDrawing(true);

      const newLine = {
        from: { componentId, nodeId },
        x1: pixelX,
        y1: pixelY,
        x2: pixelX,
        y2: pixelY,
        segments: [], // Initialize segments array
      };
      setCurrentLine(newLine);
      currentLineRef.current = newLine; // Keep track of the line in ref
    } else {
      console.log("End Of Line", {
        componentId,
        nodeId,
        currentLineRef: currentLineRef.current,
      });
      //Set where the node is connected too.
      if (currentLineRef.current.from.componentId) {
        setComponents((prevComponents) => {
          return prevComponents.map((comp) => {
            if (comp.id === currentLineRef.current.from.componentId) {
              // Update the component where the line started
              const newConnectionStart = {
                nodeId: currentLineRef.current.from.nodeId,
                connectedToComponentId: componentId,
                connectedToNodeId: nodeId,
              };
              const updatedConnectionsStart = comp.connections
                ? [...comp.connections, newConnectionStart]
                : [newConnectionStart];

              return { ...comp, connections: updatedConnectionsStart };
            } else if (comp.id === componentId) {
              // Update the component where the line ended
              const newConnectionEnd = {
                nodeId: nodeId,
                connectedToComponentId: currentLineRef.current.from.componentId,
                connectedToNodeId: currentLineRef.current.from.nodeId,
              };
              const updatedConnectionsEnd = comp.connections
                ? [...comp.connections, newConnectionEnd]
                : [newConnectionEnd];

              return { ...comp, connections: updatedConnectionsEnd };
            }
            return comp;
          });
        });
      }

      const Segments = [
        currentLineRef.current.x2,
        currentLineRef.current.y2,
        pixelX,
        pixelY,
      ];

      setCurrentLine((current) => {
        const newState = {
          ...current,
          x2: pixelX,
          y2: pixelY,
          to: { componentId, nodeId },
          segments: [...current.segments, Segments],
        };
        console.log("End Of Line: newState", newState);
        currentLineRef.current = newState;
        return newState;
      });

      setLines((prevLines) => {
        const newLine = {
          ...currentLineRef.current,
        };
        return [...prevLines, newLine];
      });
      console.log("lines", lines);
      //Clear previous line
      setCurrentLine(null);
      currentLineRef.current = null;
      setIsDrawing(false);
      console.log("setIsDrawing")
    }
  };

    // Set up event listeners in useEffect
    useEffect(() => {
      const gridElement = document.querySelector(".grid");
      console.log("Useeffect ran",isDrawing)
  
      // Since these are now stable functions, we can directly use them
      if (isDrawing) {
        document.addEventListener("mousemove", updateLineToCursor);
      }
      else{
        document.removeEventListener("mousemove", updateLineToCursor);
      }
      gridElement.addEventListener("click", handleGridClick);
      gridElement.addEventListener("dblclick", handleDoubleClick);
  
      // Cleanup event listeners on unmount
      return () => {
        if (!isDrawing) {
          document.removeEventListener("mousemove", updateLineToCursor);
        }
        gridElement.removeEventListener("click", handleGridClick);
        gridElement.removeEventListener("dblclick", handleDoubleClick);
      };
    }, [isDrawing,updateLineToCursor, handleGridClick, handleDoubleClick]);

  //---------------------------------------------
  const rotateComponent = (uniqueId) => {
    setComponents((prevComponents) =>
      prevComponents.map((comp) => {
        if (comp.id === uniqueId) {
          let newX = comp.x;
          let newY = comp.y;
          const newRotation = (comp.rotation || 0) + 90;

          // Example adjustment: Move right by half a cell on each rotation
          console.log(newRotation);

          switch (newRotation) {
            case 90:
              newX += 0.5;
              newY += 0.5;
              break;
            case 180:
              newX -= 0.5;
              newY += 0.5;
              break;
            case 270:
              newX -= 0.5;
              newY -= 0.5;
              break;
            case 360:
              newX += 0.5;
              newY -= 0.5;
              break;
          }
          console.log(comp.x, comp.y, newX, newY);
          return { ...comp, x: newX, y: newY, rotation: newRotation % 360 };
        }
        return comp;
      })
    );
  };

  const handleDrop = (item, x, y) => {
    setComponents((prevComponents) => {
      // Count how many components of the same type already exist
      const typeCount = prevComponents.filter(
        (comp) => comp.type === item.type
      ).length;

      // Create a new ID using the first letter of the component type and the new count
      const newId = `${item.type.charAt(0).toLowerCase()}${typeCount + 1}`;

      // Add the new component with the new ID and other properties
      return [
        ...prevComponents,
        {
          ...item,
          id: newId,
          x,
          y,
          rotation: 0,
          value: item.value,
          numberOfNodes: item.numberOfNodes,
          connections: [],
        },
      ];
    });
  };

  const renderComponent = (component, index) => {
    const imageUrl = `/assets/${component.type}.svg`; // Path to your SVG assets
    //console.log(`Original component.x: ${component.x}, component.y: ${component.y}`);

    const renderDevInfo = () => {
      if (devMode) {
        return (
          <div
            style={{
              position: "absolute",
              top: "60px",
              left: "0",
              color: "blue",
              fontSize: "12px",
            }}
          >
            <div>ID: {component.id}</div>
            <div>Value: {component.value}</div>
            <div>Connections: {JSON.stringify(component.connections)}</div>
          </div>
        );
      }
      return null;
    };

    return (
      <div
        key={index}
        style={{
          position: "absolute",
          left: `${component.x * 50}px`,
          top: `${component.y * 50 - 25}px`,
          transform: `rotate(${component.rotation || 0}deg)`,
        }}
      >
        <img
          key={index}
          src={imageUrl}
          alt={component.id}
          style={{
            width: "50px", // Match the grid cell width
            cursor: "pointer",
          }}
          //onDoubleClick={() => rotateComponent(component.id)}
        />
        <Node
          componentId={component.id}
          nodeId="input"
          onNodeClick={handleNodeClick}
          x={component.x}
          y={component.y}
          degree={component.rotation || 0}
          devMode={devMode}
        />
        {/* Conditionally render the output node if numberOfNodes is 2 */}
        {component.numberOfNodes === 2 && (
          <Node
            componentId={component.id}
            nodeId="output"
            onNodeClick={handleNodeClick}
            x={component.x}
            y={component.y}
            degree={component.rotation || 0}
            devMode={devMode}
          />
        )}
        {devMode && renderDevInfo()}
      </div>
    );
  };
  // Create 100 cells and render placed components within them
  const gridCells = Array.from({ length: 100 }, (_, index) => (
    <GridCell
      key={index}
      onDrop={handleDrop}
      x={index % 10}
      y={Math.floor(index / 10)}
    />
  ));

  return (
    <div
      className="grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(10, 1fr)",
        gridTemplateRows: "repeat(10, 1fr)",
        width: "500px",
        height: "500px",
        position: "relative",
      }}
    >
      {gridCells}

      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
        }}
      >
        {/* Render current line segments if being drawn */}
        {currentLine?.segments?.map((segment, index) => (
          <line
            key={index}
            x1={segment.x1}
            y1={segment.y1}
            x2={segment.x2}
            y2={segment.y2}
            stroke="blue"
            strokeWidth={4}
          />
        ))}

        {/* Render stored lines */}
        {lines.map((line, index) =>
          line.segments?.map((segment, segIndex) => (
            <line
              key={`${index}-${segIndex}`}
              x1={segment.x1}
              y1={segment.y1}
              x2={segment.x2}
              y2={segment.y2}
              stroke="blue"
              strokeWidth={4}
            />
          ))
        )}
      </svg>

      {components.map(renderComponent)}
    </div>
  );
};

export default Grid;

/*
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, }}>
        {currentLineRef.current && (
          <line
            x1={currentLineRef.current.x1} y1={currentLineRef.current.y1}
            x2={currentLineRef.current.x2} y2={currentLineRef.current.y2}

            stroke="blue" strokeWidth={4} />
        )}

        {lines.map((line, index) => (
          <line
            key={index}
            x1={line.x1} y1={line.y1}
            x2={line.x2} y2={line.y2}
            stroke="blue" strokeWidth={4} />
        ))}
      </svg>
*/
