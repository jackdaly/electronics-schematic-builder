import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';

const ComponentItem = ({ component }) => {
    const [rotation, setRotation] = useState(0);
    const [{ isDragging }, drag, preview] = useDrag(() => ({
        type: component.type,
        item: { id: component.name, type: component.type, rotation: 0, value: component.value, numberOfNodes: component.numberOfNodes  },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
        end: () => {
            setRotation(0); // Reset rotation when dropped
        }
    }));

    const imageUrl = `/assets/${component.type}.svg`; // Path to your SVG assets

    //console.log('isDragging:', component.type);

    return (
        <div  ref={drag} style={{ //onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
            opacity: isDragging ? 0.5 : 1,
            transform: `rotate(${rotation}deg)`, // Apply rotation
            transformOrigin: 'center', // Explicitly set the origin of transformation
            padding: '5px',
            margin: '5px',
            cursor: 'move',
            display: 'inline-block', // To allow transform to work correctly
            
        }}>
            <img src={imageUrl} alt={component.name} width="40" height="40" />
            <div>
                <span>Value: {component.value}</span><br />
                <span>Nodes: {component.numberOfNodes}</span>
            </div>
        </div>
    );
};

const Toolbar = ({ components }) => {
  return (
    <div className="toolbar" style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
      {components.map((component, index) => (
        <ComponentItem key={index} component={component} />
      ))}
    </div>
  );
};

export default Toolbar;

