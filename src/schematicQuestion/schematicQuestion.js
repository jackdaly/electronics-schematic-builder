import "./schematicQuestion.css";

import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import { HTML5Backend } from "react-dnd-html5-backend";
import Header from "./Header";
import Instruction from "./Instruction";
import Grid from "./Grid";
import Toolbar from "./Toolbar";
import TestButton from "./TestButton";

import { simulate } from "./nodalAnalysis"; // Import the analysis function

import { v4 as uuidv4 } from "uuid"; // Import UUID

const componentsArray = [
  {
    name: "Resistor",
    id: uuidv4(),
    type: "resistor",
    value: "1000",
    numberOfPorts: 2,
  },
  {
    name: "Resistor",
    id: uuidv4(),
    type: "resistor",
    value: "1000",
    numberOfPorts: 2,
  },
  {
    name: "Resistor",
    id: uuidv4(),
    type: "resistor",
    value: "500",
    numberOfPorts: 2,
  },

  {
    name: "Battery",
    id: uuidv4(),
    type: "battery",
    value: "10",
    numberOfPorts: 2,
  },
];

const SchematicQuestion = () => {
  const [components, setComponents] = useState([]);
  const [labelledLines, setLabelledLines] = useState([]);
  const [answerState, setAnswerState] = useState([]);

  // console.log("answerState", answerState);

  const progress = 50; // Just for demonstration.
  const devMode = false;
  const questionAnswerPairs = [
    {
      question: "Draw a voltage divider that splits any input voltage in half",
      answer: {
        V_1: 5.0,
        V_2: 10.0,
        I_0_2: 0.01,
      },
    },
  ];

  const handleLinesUpdate = (updatedLines) => {
    setLabelledLines(updatedLines); // Store the updated lines in state
  };

  const handleTestCircuit = (components) => {
    console.log(components.length);
    // Function to check if all ports are connected
    const areAllPortsConnected = () => {
      return components.every(
        (component) => component.connections.length === component.numberOfPorts
      );
    };

    // Test circuit logic will go here.
    const traceCircuit = (components) => {
      const battery = components.find((comp) => comp.type === "battery");
      if (!battery) {
        console.error("No battery found in the circuit");
        return;
      }

      var circuitData = [];
      const visited = new Set(); // To keep track of visited components to avoid infinite loops
      const junctions = []; // To store junctions

      const tracePath = (currentComponentId, prevComponentId = null) => {
        if (visited.has(currentComponentId)) {
          // If we visit a component we've already visited, it's a junction.
          junctions.push(currentComponentId);
          return;
        }

        visited.add(currentComponentId);
        const currentComponent = components.find(
          (comp) => comp.id === currentComponentId
        );
        if (!currentComponent) {
          console.error(
            "Broken circuit, missing component:",
            currentComponentId
          );
          return;
        }

        // Add current component's data to circuitData
        circuitData.push({
          id: currentComponent.id,
          type: currentComponent.type,
          value: currentComponent.value,
          connections: currentComponent.connections,
        });

        // Find all unique connections that lead to different components
        const uniqueConnections = currentComponent.connections.filter(
          (conn) => conn.connectedToComponentId !== prevComponentId
        );

        // If more than one unique connection, it's a junction.
        if (uniqueConnections.length > 1) {
          junctions.push(currentComponent.id);
        }

        // Recursively trace the path from the current component
        uniqueConnections.forEach((conn) => {
          tracePath(conn.connectedToComponentId, currentComponentId);
        });
      };

      // Start tracing from the battery
      tracePath(battery.id);

      // Identify isolated components after tracing the circuit
      const isolatedComponents = circuitData
        .filter(
          (compData) =>
            compData.connections.length === 1 && compData.type !== "battery"
        )
        .map((compData) => compData.id);

      //Map the connections
      const mapAllConnections = (circuitData) => {
        const allConnections = [];
        const existingConnections = new Set(); // Use a Set to store existing connections

        circuitData.forEach((component) => {
          component.connections.forEach((conn) => {
            // Create a string representation of both direct and flipped connection
            const directConnKey = `${component.id}_${conn.portId}-${conn.connectedToComponentId}_${conn.connectedToPortId}`;
            const flippedConnKey = `${conn.connectedToComponentId}_${conn.connectedToPortId}-${component.id}_${conn.portId}`;

            // Check if either version of the connection already exists
            if (
              !existingConnections.has(directConnKey) &&
              !existingConnections.has(flippedConnKey)
            ) {
              const newConnectionLine = {
                conn_id: uuidv4(),
                type: "connection",
                src_node: `${component.id}_${conn.portId}`,
                tar_node: `${conn.connectedToComponentId}_${conn.connectedToPortId}`,
                label: conn.label,
              };

              // Add the new connection
              allConnections.push(newConnectionLine);

              // Store both versions of the connection key
              existingConnections.add(directConnKey);
              existingConnections.add(flippedConnKey);
            }
          });
        });

        return allConnections;
      };

      const mappedConnections = mapAllConnections(circuitData);
      console.log("Mapped Connections:", mappedConnections);
      //Add portid to circitData
      circuitData.forEach((component) => {
        // Initialize ports array for each component
        component.ports = [];
        component.connections.forEach((conn) => {
          // Create a port ID by concatenating the component ID and the connection's port ID
          const portId = `${component.id}_${conn.portId}`;
          // Append this port ID to the component's ports array
          component.ports.push(portId);
        });
        // At this point, component.ports contains all port IDs for this component
        // If you need to perform any additional actions with the ports array, you can do so here
      });

      //Add connections to circuitdata
      circuitData = circuitData.concat(mappedConnections);
      // Now, circuitData contains the traced path with junctions and isolatedComponents contains components with only one connection
      return {
        circuitData,
        junctions,
        isolatedComponents,
        mappedConnections,
      };
    };
    // Check if all ports are connected before proceeding
    if (!areAllPortsConnected()) {
      alert(
        "Some ports are not connected. Please check the circuit and try again."
      );
      return;
    }

    const circuitData = traceCircuit(components);
    console.log("Traced Circuit Data:", circuitData);
    console.log("labelledLines FILTER BEFORE", labelledLines);
    function filterLinesWithTo(lines) {
      return lines.filter((line) => line.to);
    }
    var linesWithTo = filterLinesWithTo(labelledLines);
    setLabelledLines(linesWithTo);
    console.log("linesWithTo FILTER AFTER", linesWithTo);
    console.log("labelledLines FILTER AFTER", labelledLines);

    //Clean up connections

    if (circuitData) {
      const [outputDict, nodes_list] = simulate(
        circuitData.circuitData,
        circuitData.mappedConnections,
        linesWithTo
      );

      const referenceSolution = questionAnswerPairs[0].answer;
      console.log("referenceSolution", referenceSolution);
      console.log("outputDict", outputDict);
      const result = {};

      let allCorrect = true; // Flag to track if all answers are correct

      // Check the output against the reference solution
      for (const [key, refValue] of Object.entries(referenceSolution)) {
        const outputValue = outputDict[key];
        // Check if the key exists in the output and compare the values
        if (outputValue !== undefined) {
          // Allow for a small margin of error in floating point comparisons
          const isCorrect = Math.abs(refValue - outputValue) < 0.01;
          result[key] = {
            expected: refValue,
            actual: outputValue,
            correct: isCorrect,
          };
          if (!isCorrect) {
            allCorrect = false; // If any value is incorrect, update the flag
          }
        } else {
          // If the key is missing in the output, mark as incorrect
          result[key] = {
            expected: refValue,
            actual: "N/A",
            correct: false,
          };
          allCorrect = false;
        }
      }

      // Update the answer state based on the overall correctness
      setAnswerState(allCorrect ? "correct" : "incorrect");
      console.log("Result of comparison:", result);

      console.log("result", result);
    } else {
      console.log("No components");
    }
  };

  return (
    <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
      <div className="schematicQuestion">
        <Header progress={progress} />
        <div className="content">
          <Instruction text={questionAnswerPairs[0].question} />
          <Grid
            components={components}
            setComponents={setComponents}
            devMode={devMode}
            labelledLines={labelledLines}
            onLinesUpdate={handleLinesUpdate}
          />
        </div>
        <div className="footer">
          <Toolbar
            components={componentsArray}
            answerState={answerState}
            setAnswerState={setAnswerState}
          />
          <TestButton
            answerState={answerState}
            setAnswerState={setAnswerState}
            onTest={() => handleTestCircuit(components)}
          />
        </div>
      </div>
    </DndProvider>
  );
};

export default SchematicQuestion;
