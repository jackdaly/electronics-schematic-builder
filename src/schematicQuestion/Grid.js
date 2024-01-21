import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useContext,
} from "react";
import { useDrop } from "react-dnd";

import { v4 as uuidv4 } from "uuid"; // Import UUID

// Create a Context for the Grid Size
const GridSizeContext = createContext(50); // Default value is 50

// Custom hook to use the GridSize context
export const useGridSize = () => useContext(GridSizeContext);

// const GridSize = 50;
// const GridWidth = 500;
// const GridHeight = 250;

const GridCell = ({ onDrop, x, y, numRows, numCols }) => {
  const GridSize = useGridSize(); // Get the current GridSize from the context
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
            width: `${GridSize}px`, // Match the grid cell width
            opacity: 0.5, // 50% opacity for preview
            position: "absolute",
            left: "0", // Align with the left edge of the cell
            bottom: `${GridSize / 2}px`, // Align with the bottom edge of the cell
            pointerEvents: "none", // Ensures the image doesn't interfere with drop events
          }}
        />
      );
    }
    return null;
  };

  const getBorderRadiusStyle = () => {
    const radius = "20px";
    if (x === 0 && y === 0) return { borderTopLeftRadius: radius }; // Top-left cell
    if (x === numCols - 1 && y === 0) return { borderTopRightRadius: radius }; // Top-right cell
    if (x === 0 && y === numRows - 1) return { borderBottomLeftRadius: radius }; // Bottom-left cell
    if (x === numCols - 1 && y === numRows - 1)
      return { borderBottomRightRadius: radius }; // Bottom-right cell
    return {};
  };
  // console.log('GridCell X ',x)
  // console.log('GridCell Y ',y)
  // console.log('numCols ',numCols)
  // console.log('numRows ',numRows)

  const cellStyle = {
    width: `${GridSize}px`,
    height: `${GridSize}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    borderRight: "2px solid #AFE5FF",
    borderBottom: "2px solid #AFE5FF",
    borderTop: y === 0 ? "2px solid #AFE5FF" : "", // Add top border for the first row
    borderLeft: x === 0 ? "2px solid #AFE5FF" : "", // Add left border for the first column
    backgroundColor: "transparent",
    position: "relative", // Needed for absolute positioning of children
    ...getBorderRadiusStyle(),
  };

  return (
    <div ref={drop} style={cellStyle}>
      {renderPreview()}
    </div>
  );
};

const Port = ({ componentId, portId, onPortClick, x, y, degree, devMode }) => {
  const GridSize = useGridSize(); // Get the current GridSize from the context
  // Adjust for the grid's offset and the port's size
  const portx = x * GridSize + (portId === "input" ? 0 : GridSize);
  const porty = y * GridSize;

  const portSize = 40;

  return (
    <div
      data-component-id={componentId}
      data-port-id={portId}
      data-x={portx}
      data-y={porty}
      className="port"
      onClick={(e) => onPortClick(e, componentId, portId, portx, porty)}
      style={{
        width: `${portSize}px`,
        height: `${portSize}px`,
        backgroundColor: devMode ? "red" : "transparent",
        top: `${GridSize / 2 - portSize / 2}px`,
        left:
          portId === "input"
            ? `${-(portSize / 2)}px`
            : `${GridSize - portSize / 2}px`,
        transform: "rotate(" + degree + "deg)",
        position: "absolute",
        cursor: "pointer",
      }}
    />
  );
};

const Grid = ({ components, setComponents, devMode, onLinesUpdate }) => {
  //const [components, setComponents] = useState([]);
  const [lines, setLines] = useState([]); // Store lines
  const [currentLine, setCurrentLine] = useState(null); // Currently drawn line
  const [isDrawing, setIsDrawing] = useState(false);

  const baseCellWidth = 50;

  const containerRef = useRef(null); // Ref for the container element
  const [numCellsWidth, setNumCellsWidth] = useState(); // Number of cells horizontally
  const [numCellsHeight, setNumCellsHeight] = useState(); // Default value, you can calculate the initial value based on the container's height

  const [GridSize, setGridSize] = useState(50); // Initial GridSize

  // Function to update grid size based on container width
  // Assume a base cell size (e.g., each cell should be at least 50px wide)

  const updateGridSize = useCallback(() => {
    console.log("updateGridSize called");
    const containerWidth = containerRef.current.offsetWidth;

    // Calculate how many cells can fit into the width
    let newNumCellsWidth = Math.floor(containerWidth / baseCellWidth);

    // Ensure there is at least one cell
    if (newNumCellsWidth < 1) newNumCellsWidth = 1;

    // Now calculate the cell size based on the actual number of cells that can fit
    const newGridSizeWidth = containerWidth / newNumCellsWidth;

    // Set the height to be 2/3 of the width
    const newNumCellsHeight = Math.ceil((1 / 3) * newNumCellsWidth);

    // Update state for the number of cells as well as the cell size
    setNumCellsWidth(newNumCellsWidth);
    setNumCellsHeight(newNumCellsHeight);
    setGridSize(newGridSizeWidth); // This assumes cells are square
  }, []); // Make sure to list all the dependencies needed by this function

  useEffect(() => {
    updateGridSize();
    window.addEventListener("resize", updateGridSize);

    return () => {
      window.removeEventListener("resize", updateGridSize);
    };
  }, [updateGridSize]); // UpdateGridSize has to be listed in the dependency array

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

  const snapToGrid = (x, y) => {
    const snappedX = Math.round(x / GridSize) * GridSize;
    const snappedY = Math.round(y / GridSize) * GridSize;
    return { snappedX, snappedY };
  };

  // Helper function to check if two line segments intersect
  const doSegmentsIntersect = (segment1, segment2) => {
    const det =
      (segment1.x2 - segment1.x1) * (segment2.y2 - segment2.y1) -
      (segment1.y2 - segment1.y1) * (segment2.x2 - segment2.x1);
    if (det === 0) {
      console.log(
        "LPA Checking intersection between segments: returning false"
      );
      return false; // segments are parallel
    }
    const lambda =
      ((segment2.y2 - segment2.y1) * (segment2.x2 - segment1.x1) +
        (segment2.x1 - segment2.x2) * (segment2.y2 - segment1.y1)) /
      det;
    const gamma =
      ((segment1.y1 - segment1.y2) * (segment2.x2 - segment1.x1) +
        (segment1.x2 - segment1.x1) * (segment2.y2 - segment1.y1)) /
      det;
    const intersects = 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
    console.log(`LPA Checking intersection between segments:`, {
      segment1,
      segment2,
      intersects,
    });
    return intersects;
  };

  // Helper function to check if a line segment overlaps with a component
  const doesSegmentOverlapComponent = (segment, component) => {
    // Assuming each component occupies a rectangular area
    const componentRect = {
      left: component.x,
      right: component.x + component.width, // You might need to adjust this based on how you define width
      top: component.y,
      bottom: component.y + component.height, // You might need to adjust this based on how you define height
    };
    // Check if the line segment intersects this rectangle
    // This is a simplified check and may need to be expanded for accuracy
    const overlaps =
      segment.x1 < componentRect.right &&
      segment.x2 > componentRect.left &&
      segment.y1 < componentRect.bottom &&
      segment.y2 > componentRect.top;
    console.log(`LPA Checking overlap between segment and component:`, {
      segment,
      component,
      overlaps,
    });
    return overlaps;
  };

  // Function to check if a segment overlaps with existing lines or components
  const doesSegmentOverlap = (segment, existingLines, components) => {
    console.log(`LPA segment, existingLines, components:`, {
      segment,
      existingLines,
      components,
    });
    // Check against other line segments
    const lineOverlap = existingLines.some((line) => {
      return (
        line.segments &&
        line.segments.some((existingSegment) =>
          doSegmentsIntersect(segment, existingSegment)
        )
      );
    });

    // Check against components
    const componentOverlap = components.some((component) =>
      doesSegmentOverlapComponent(segment, component)
    );

    return lineOverlap || componentOverlap;
  };

  const calculateLShapedPath = (
    startX,
    startY,
    endX,
    endY,
    existingLines,
    components
  ) => {
    const { snappedX, snappedY } = snapToGrid(endX, endY);

    // First try going horizontal then vertical
    const pathOption1 = [
      { x1: startX, y1: startY, x2: snappedX, y2: startY },
      { x1: snappedX, y1: startY, x2: snappedX, y2: snappedY },
    ];

    // Then try going vertical then horizontal
    const pathOption2 = [
      { x1: startX, y1: startY, x2: startX, y2: snappedY },
      { x1: startX, y1: snappedY, x2: snappedX, y2: snappedY },
    ];

    // Check if either path option overlaps with existing lines or components
    const option1Overlaps = pathOption1.some((segment) =>
      doesSegmentOverlap(segment, existingLines, components)
    );
    const option2Overlaps = pathOption2.some((segment) =>
      doesSegmentOverlap(segment, existingLines, components)
    );

    console.log(`LPA Path options overlap status:`, {
      option1Overlaps,
      option2Overlaps,
    });

    // Choose the path that doesn't overlap, or if both overlap, default to the first option
    return option1Overlaps && !option2Overlaps ? pathOption2 : pathOption1;
  };

  //-----------------------

  useEffect(() => {
    // Synchronize ref with state
    currentLineRef.current = currentLine;
  }, [currentLine]);

  // Define event handlers using useCallback
  const updateLineToCursor = useCallback(
    (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      console.log("updateLineToCursor -------");
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

        // Get the grid's bounding rectangle
        const gridRect = document
          .querySelector(".grid")
          .getBoundingClientRect();

        // Calculate any padding or margin. This is an example; you'll need to adjust based on your actual CSS
        const containerStyle = window.getComputedStyle(
          document.querySelector(".grid")
        ); // Assuming .grid-container is your grid's parent element
        const paddingTop = parseFloat(containerStyle.paddingTop);
        const paddingLeft = parseFloat(containerStyle.paddingLeft);
        const marginLeft = parseFloat(containerStyle.marginLeft);

        // Calculate cursor position relative to the grid, adjusting for padding and margin
        const cursorX = clientX - gridRect.left - paddingLeft - marginLeft;
        const cursorY = clientY - gridRect.top - paddingTop;

        const lShapedPath = calculateLShapedPath(
          current.x1,
          current.y1,
          cursorX,
          cursorY,
          lines,
          components
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
    },
    [lines, components]
  ); // Add necessary dependencies

  const handleGridClick = useCallback((e) => {
    console.log("handleGridClick");

    // Ensure we're dealing with the grid and not a port
    if (!e.target.classList.contains("port")) {
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
        // In Grid.js, wherever you update the lines
        setLines((updatedLines) => {
          onLinesUpdate(updatedLines); // Use the callback passed via props
          return updatedLines;
        });

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

  // When double-clicking, remove the last line drawn by filtering it out from the lines array using the ID
  const handleDoubleClick = useCallback(() => {
    if (isDrawing) {
      setLines((prevLines) =>
        prevLines.filter((line) => line.id !== currentLineRef.current.id)
      );
      setCurrentLine(null); // Clear the current line
      currentLineRef.current = null; // Clear the reference
      setIsDrawing(false); // Stop drawing
    }
  }, [isDrawing]);

  const handlePortClick = (e, componentId, portId, x, y) => {
    
    e.stopPropagation(); // This stops the event from propagating further
    console.log("handlePortClick", {
      componentId,
      portId,
      currentLineRef: currentLineRef.current,
    });
    //Should return position of port (not adjusted for offset)
    const pixelX = parseInt(e.target.dataset.x, 10);
    const pixelY = parseInt(e.target.dataset.y, 10);

    console.log("currentLineRef", currentLineRef);

    const isLineStarted = currentLineRef.current != null;
    if (!isLineStarted) {
      // Start the line
      console.log("Start of line");
      setIsDrawing(true);

      const newLine = {
        from: { componentId, portId },
        id: uuidv4(),
        x1: pixelX,
        y1: pixelY,
        x2: pixelX,
        y2: pixelY,
        segments: [], // Initialize segments array
      };
      setCurrentLine(newLine);
      currentLineRef.current = newLine; // Keep track of the line in ref
    } else if (isDrawing) {
      console.log("isDrawing", isDrawing);
      console.log("End Of Line", {
        componentId,
        portId,
        currentLineRef: currentLineRef.current,
      });

      if (currentLineRef.current.from.componentId) {
        console.log("Currnet line component trigger", currentLineRef);
        setComponents((prevComponents) => {
          return prevComponents.map((comp) => {
            if (comp.id === currentLineRef.current.from.componentId) {
              // Update the component where the line started
              const newConnectionStart = {
                portId: currentLineRef.current.from.portId,
                connectedToComponentId: componentId,
                connectedToPortId: portId,
              };
              const updatedConnectionsStart = comp.connections
                ? [...comp.connections, newConnectionStart]
                : [newConnectionStart];

              return { ...comp, connections: updatedConnectionsStart };
            } else if (comp.id === componentId) {
              // Update the component where the line ended
              const newConnectionEnd = {
                portId: portId,
                connectedToComponentId: currentLineRef.current.from.componentId,
                connectedToPortId: currentLineRef.current.from.portId,
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

      //Detect if its touch
      if (e.type.startsWith("touch")) {
        setCurrentLine((current) => {
          var newState = {
            ...current,
            x2: pixelX,
            y2: pixelY,
            to: { componentId, portId },
          };

          if (current) {
            const labelPosition = {
              x: current.x2 + 20,
              y: current.y2 + 10,
            };
            const LabelledState = {
              ...newState,
              label: { id: uuidv4(), text: "", position: labelPosition },
            };
            newState = LabelledState;
          }

          console.trace("End Of Line: newState", newState);
          currentLineRef.current = newState;
          return newState;
        });
      } else {

    // Check if the line is being connected to a different port
    if (
      currentLineRef.current &&
      (currentLineRef.current.from.componentId !== componentId ||
        currentLineRef.current.from.portId !== portId)
    ) {
        const Segments = {
          x1: currentLineRef.current.x2,
          y1: currentLineRef.current.y2,
          x2: pixelX,
          y2: pixelY,
        };

        setCurrentLine((current) => {
          var newState = {
            ...current,
            x2: pixelX,
            y2: pixelY,
            to: { componentId, portId },
            segments: current.segments
              ? [...current.segments, Segments]
              : [Segments],
            // label: { id: uuidv4(), text: "test", position: labelPosition },
          };

          if (current) {
            const labelPosition = {
              x: current.x2 + 20,
              y: current.y2 + 10,
            };
            const LabelledState = {
              ...newState,
              label: { id: uuidv4(), text: "", position: labelPosition },
            };
            newState = LabelledState;
          }

          console.trace("End Of Line: newState", newState);
          currentLineRef.current = newState;
          return newState;
        });
      } else {
        // If the line is being connected to the same port, ignore the action
        console.log("Attempting to connect a line to the same port, action ignored.");
        setCurrentLine(null); // Clear the current line if any
        currentLineRef.current = null;
        setIsDrawing(false); // Stop drawing
      }


      }

      setLines((prevLines) => {
        const newLine = {
          ...currentLineRef.current,
        };
        return [...prevLines, newLine];
      });
      // In Grid.js, wherever you update the lines
      setLines((updatedLines) => {
        onLinesUpdate(updatedLines); // Use the callback passed via props
        return updatedLines;
      });
      console.log("lines", lines);
      //Clear previous line
      setCurrentLine(null);
      currentLineRef.current = null;
      setIsDrawing(false);
      console.log("END IF STATEMENT setIsDrawing"); //runs this
    }
  };

  //Line follow finger:
  const addSegmentToLine = (e) => {
    const touch = e.touches[0];
    const clientX = touch.clientX;
    const clientY = touch.clientY;
    // Adjust coordinates relative to the SVG container if necessary
    const svgRect = containerRef.current.getBoundingClientRect();
    const relativeX = clientX - svgRect.left;
    const relativeY = clientY - svgRect.top;

    // Snap the coordinates to the grid size
    const snappedX = Math.round(relativeX / GridSize) * GridSize;
    const snappedY = Math.round(relativeY / GridSize) * GridSize;
    try{
    setCurrentLine((current) => {
      if (current) {
        console.log("Touch Current line", current);
        var newState = { ...current, x2: snappedX, y2: snappedY };

        // If there's no current line, start a new one
        if (!current.segments || current.segments.length < 1) {
          console.log("No current line");
          newState.segments.push({
            x1: snappedX,
            y1: snappedY,
            x2: snappedX,
            y2: snappedY,
          });
          return {
            newState,
            // ... other initial line properties ...
          };
        }

        // Create a new state object from the current state
        console.log("Touch Line if there is currentline", current);
        // If the new point is the same as the last point, don't add a new segment
        const lastSegment = newState.segments[newState.segments.length - 1];
        if (lastSegment.x2 !== snappedX || lastSegment.y2 !== snappedY) {
          // Add a new segment to the line
          newState.segments.push({
            x1: lastSegment.x2,
            y1: lastSegment.y2,
            x2: snappedX,
            y2: snappedY,
          });
        }

        // Return the new state
        return newState;
      } else {
        return current;
      }
    });
  }
  catch(err){
    console.error(err.message)
  }
  };

  // Touch Start Handler
  const handleTouchStart = useCallback(
    (e) => {
      console.log("Touch Start", e);
      const touch = e.touches[0];
      const elementUnderFinger = document.elementFromPoint(
        touch.clientX,
        touch.clientY
      );

      if (elementUnderFinger.classList.contains("port")) {
        console.log("Touch Start on port");

        // Retrieve the componentId and portId from the dataset of the element
        const componentId = elementUnderFinger.dataset.componentId;
        const portId = elementUnderFinger.dataset.portId;

        console.log("componentId / portid", componentId, portId);

        setIsDrawing(true); // Start drawing only if the touch starts on a port
        handlePortClick(e, componentId, portId, touch.clientX, touch.clientY);
      }
    },
    [handlePortClick]
  );

  // Touch Move Handler
  const handleTouchMove = useCallback(
    (e) => {
      console.log("Touch moving at all?");
      if (isDrawing) {
        console.log("Touch moving add");
        // Only update the line if drawing is active
        e.preventDefault(); // Prevent default behavior like scrolling

        addSegmentToLine(e);
        // updateLineToCursor(touch.clientX, touch.clientY);
      }
    },
    [addSegmentToLine, isDrawing]
  );

  const areCollinear = (seg1, seg2) => {
    // Calculate the direction vectors of the segments
    const dir1 = { x: seg1.x2 - seg1.x1, y: seg1.y2 - seg1.y1 };
    const dir2 = { x: seg2.x2 - seg2.x1, y: seg2.y2 - seg2.y1 };
    // Check if the direction vectors are proportional (cross product is zero)
    return dir1.x * dir2.y === dir1.y * dir2.x;
  };

  // Helper function to check if a point is between two others on a line
  const isBetween = (a, b, c) => {
    const crossproduct = (c.y - a.y) * (b.x - a.x) - (b.y - a.y) * (c.x - a.x);
    if (Math.abs(crossproduct) !== 0) return false; // Not collinear
    const dotproduct = (c.x - a.x) * (b.x - a.x) + (c.y - a.y) * (b.y - a.y);
    if (dotproduct < 0) return false; // c is before a
    const squaredlengthba =
      (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y);
    if (dotproduct > squaredlengthba) return false; // c is after b
    return true; // c is between a and b
  };

  // Function to process and clean up the line
  const processLineSegments = (line) => {
    // Start with the first segment
    const newSegments = [line.segments[0]];
    for (let i = 1; i < line.segments.length; i++) {
      const lastNewSeg = newSegments[newSegments.length - 1];
      const currentSeg = line.segments[i];

      // If the current segment is collinear with the last new segment and the end point of the current segment
      // is between the start and end points of the last new segment, skip this segment
      if (
        areCollinear(lastNewSeg, currentSeg) &&
        isBetween(
          { x: lastNewSeg.x1, y: lastNewSeg.y1 },
          { x: lastNewSeg.x2, y: lastNewSeg.y2 },
          { x: currentSeg.x2, y: currentSeg.y2 }
        )
      ) {
        // Extend the last new segment to the end of the current segment
        lastNewSeg.x2 = currentSeg.x2;
        lastNewSeg.y2 = currentSeg.y2;
      } else {
        // Otherwise, add the current segment as a new segment
        newSegments.push(currentSeg);
      }
    }
    return { ...line, segments: newSegments };
  };

  // Touch End Handler
  const handleTouchEnd = useCallback(
    (e) => {
      console.log("Touch End ran");
      if (isDrawing) {
        // Only process the touch end if a line is being drawn
        const touch = e.changedTouches[0];
        const elementUnderFinger = document.elementFromPoint(
          touch.clientX,
          touch.clientY
        );

        if (elementUnderFinger.classList.contains("port")) {
          // Retrieve the componentId and portId from the dataset of the element
          const componentId = elementUnderFinger.dataset.componentId;
          const portId = elementUnderFinger.dataset.portId;

          const isValidLine =
            currentLineRef.current &&
            currentLineRef.current.from.componentId !== componentId &&
            !currentLineRef.current.segments.includes(undefined) &&
            (currentLineRef.current.x1 !== currentLineRef.current.x2 ||
              currentLineRef.current.y1 !== currentLineRef.current.y2);

          if (isValidLine) {
            //Check if its a valid line:
            const processedLine = processLineSegments(currentLineRef.current);
            setCurrentLine(processedLine);

            console.log("componentId / portid", componentId, portId);
            console.log("Touch End handlePortClick", currentLineRef);
            handlePortClick(
              e,
              componentId,
              portId,
              touch.clientX,
              touch.clientY
            );
          } else {
            setCurrentLine(null); // Cancel the line if ended elsewhere
            currentLineRef.current = null;
          }
        } else {
          setCurrentLine(null); // Cancel the line if ended elsewhere
          currentLineRef.current = null;
        }
        setIsDrawing(false); // Stop drawing in any case
      }
    },
    [handlePortClick]
  );

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
    console.log("touch device? ", isTouchDevice);
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

  const handleDragStart = () => {
    setCurrentLine(null);
    currentLineRef.current = null;
    setIsDrawing(false);
  };

  const handleDrop = (item, x, y) => {
    setCurrentLine(null);
    currentLineRef.current = null;
    setIsDrawing(false);

    setComponents((prevComponents) => {
      // Count how many components of the same type already exist
      const typeCount = prevComponents.filter(
        (comp) => comp.type === item.type
      ).length;

      // Create a new ID using the first letter of the component type and the new count
      const newId = `${item.type.charAt(0).toLowerCase()}${typeCount + 1}`;
      console.log("Position on drop: ", `${x}`, `${y}`);
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
          numberOfPorts: item.numberOfPorts,
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
    console.log("Position GRID: ", `${component.x}`, `${component.y}`);
    console.log(
      "Position X/Y: ",
      `${component.x * GridSize}px`,
      `${component.y * GridSize - GridSize / 2}px`
    );

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
      <div
        key={index}
        style={{
          position: "absolute",
          left: `${component.x * GridSize}px`,
          top: `${component.y * GridSize - GridSize / 2}px`,
          transform: `rotate(${component.rotation || 0}deg)`,
        }}
      >
        <img
          key={index}
          src={imageUrl}
          alt={component.id}
          style={{
            width: `${GridSize}px`, // Match the grid cell width
            cursor: "pointer",
          }}
          //onDoubleClick={() => rotateComponent(component.id)}
        />
        <Port
          componentId={component.id}
          portId="input"
          onPortClick={handlePortClick}
          x={component.x}
          y={component.y}
          degree={component.rotation || 0}
          devMode={devMode}
        />
        {/* Conditionally render the output port if numberOfPorts is 2 */}
        {component.numberOfPorts === 2 && (
          <Port
            componentId={component.id}
            portId="output"
            onPortClick={handlePortClick}
            x={component.x}
            y={component.y}
            degree={component.rotation || 0}
            devMode={devMode}
          />
        )}

        {/* Render component value with unit */}
        <div
          style={{
            position: "absolute",
            top: `${GridSize / 2 + 20}px`, // Slightly below the component
            left: "50%",
            transform: "translateX(-50%)", // Center the text
            color: "#3EC0FF",
            fontSize: "12px",
            textAlign: "center",
          }}
        >
          {`${displayValue}${unit}`}
        </div>
        {devMode && renderDevInfo()}
      </div>
    );
  };
  // Create 100 cells and render placed components within them
  //Calc number of cells
  // const NumCellsWidth = GridWidth/GridSize
  // const NumCellsHeight = GridHeight/GridSize

  // const TotalCells = NumCellsWidth * NumCellsHeight

  // const gridCells = Array.from({ length: TotalCells }, (_, index) => (
  //   <GridCell
  //     key={index}
  //     onDrop={handleDrop}
  //     //x={index % 10}
  //     //y={Math.floor(index / 10)}

  //     x={index % numCellsWidth}
  //     y={Math.floor(index / numCellsWidth)}
  //     cellSize={GridSize} // Pass the dynamic cell size
  //   />
  // ));

  // Render grid cells
  // const numCellsHeight = Math.ceil(GridHeight / GridSize); // Calculate the number of cells vertically
  // Calculate the total number of cells dynamically

  console.log("Position End numCellsHeight ", numCellsHeight);
  console.log("Position EndnumCellsWidth ", numCellsWidth);
  const totalCells = numCellsWidth * numCellsHeight;

  // Render grid cells
  const gridCells = Array.from({ length: totalCells }, (_, index) => (
    <GridCell
      key={index}
      onDrop={handleDrop}
      x={index % numCellsWidth}
      y={Math.floor(index / numCellsWidth)}
      numCols={numCellsWidth}
      numRows={numCellsHeight}
      // cellSize={GridSize} // Pass the dynamic cell size
    />
  ));

  //console.log("Update lines at the end of grid", lines);

  // console.log("numCellsWidth", numCellsWidth);
  // console.log("numCellsHeight", numCellsHeight);
  // console.log("GridSize", GridSize);


  return (
    <GridSizeContext.Provider value={GridSize}>
      <div
        className="grid"
        ref={containerRef} // Assign the container ref to the element
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${numCellsWidth}, 1fr)`,
          gridTemplateRows: `repeat(${numCellsHeight}, 1fr)`, // Updated to maintain aspect ratio
          //gridTemplateColumns: "repeat(10, 1fr)",
          //gridTemplateRows: "repeat(10, 1fr)",
          //width: `${GridWidth}px`,
          //height: `${GridHeight}px`,
          width: "100%",
          height: "100%",
          position: "relative",
          userSelect: "none",
          gridGap: "0",
          boxSizing: "borderBox",
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
            zIndex: 2, // Adjusted to bring the SVG on top
            pointerEvents: "none",
          }}
        >
          {/* Render current line segments if being drawn */}
          {currentLine &&
            currentLine.segments &&
            currentLine?.segments?.map((segment, index) => (
              <line
                key={index}
                x1={segment.x1}
                y1={segment.y1}
                x2={segment.x2}
                y2={segment.y2}
                stroke="#1A9BDB"
                strokeWidth={4}
              />
            ))}

          {/* Render stored lines with labels */}
          {lines.map((line, index) => (
            <React.Fragment key={index}>
              {line.segments && line.segments.length > 0 && (
                <>
                  {line.segments.map((segment, segIndex) => (
                    <line
                      key={`${index}-${segIndex}`}
                      x1={segment.x1}
                      y1={segment.y1}
                      x2={segment.x2}
                      y2={segment.y2}
                      stroke="#1A9BDB"
                      strokeWidth={4}
                    />
                  ))}
                  {/* Render label for the line */}
                  {line.label && line.label.text && (
                      <text
                        x={line.label.position.x +5}
                        y={line.label.position.y + 5}
                        fill="#1FB6FF"
                        textAnchor="middle"
                        dy=".3em" // Adjust for vertical centering
                      >
                        {line.label.text}
                      </text>
                  )}
                </>
              )}
            </React.Fragment>
          ))}
        </svg>

        {components.map(renderComponent)}
      </div>
    </GridSizeContext.Provider>
  );
};

export default Grid;