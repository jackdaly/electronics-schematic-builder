import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Header from "./Header";
import Instruction from "./Instruction";
import Grid from "./Grid";
import Toolbar from "./Toolbar";
import TestButton from "./TestButton";
import { analyzeCircuit } from './circuitAnalysis'; // Import the analysis function

const App = () => {
  const [components, setComponents] = useState([]);
  const progress = 50; // Just for demonstration.
  const devMode = true;

  const questionAnswerPairs = [
    {
      question: "Draw a voltage divider that splits any input voltage in half",
      answer: 5
    }]

  const handleTestCircuit = (components) => {
    // Test circuit logic will go here.
    const traceCircuit = (components) => {
      const battery = components.find((comp) => comp.type === "battery");
      if (!battery) {
        console.error("No battery found in the circuit");
        return;
      }

      const circuitData = [];
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

      // Now, circuitData contains the traced path with junctions and isolatedComponents contains components with only one connection
      return {
        circuitData,
        junctions,
        isolatedComponents,
      };
    };

    const circuitData = traceCircuit(components);
    console.log("Traced Circuit Data:", circuitData);
    const analysisResults = analyzeCircuit(circuitData.circuitData);
    console.log('Analysis Results:', analysisResults);

    if(questionAnswerPairs[0].answer === analysisResults){
      console.log('Correct')
    }else{
      console.log('Wrong')
    }

  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <Header progress={progress} />
        <Instruction text={questionAnswerPairs[0].question} />
        <Grid
          components={components}
          setComponents={setComponents}
          devMode={devMode}
        />
        <Toolbar
          components={[
            {
              name: "Resistor",
              type: "resistor",
              value: "1000",
              numberOfNodes: 2,
            },
            { name: "Battery", type: "battery", value: "10", numberOfNodes: 2 },
            { name: "Meter", type: "meter", value: "0", numberOfNodes: 1 },
          ]}
        />
        <TestButton onTest={() => handleTestCircuit(components)} />
      </div>
    </DndProvider>
  );
};

export default App;
