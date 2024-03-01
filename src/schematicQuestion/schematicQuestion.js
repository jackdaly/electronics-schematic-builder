import "./schematicQuestion.css";

import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import { HTML5Backend } from "react-dnd-html5-backend";
import Header from "./Header";
import Instruction from "./Instruction";
import Grid from "./Grid";
import Toolbar from "./Toolbar";
import TestButton from "./TestButton";

import { useLocation, useNavigate } from "react-router-dom";

import { simulate } from "./nodalAnalysis"; // Import the analysis function

import { v4 as uuidv4 } from "uuid"; // Import UUID

// //Deal with multiple questions
// const [currentQuestionIndex, setCurrentQuestionIndex] = useState(parseInt(questionId) - 1);
// const [totalQuestions, setTotalQuestions] = useState(null); // Set this based on your data source

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
  const [AnswerMsg, setAnswerMsg] = useState([]);

  //Deal with Database.

  const location = useLocation();
  const navigate = useNavigate();

  // Extract the questions and current index from the location state
  const questionsData = location.state?.questionsData;
  const currentQuestionIndex = location.state?.currentQuestionIndex;

  // This effect runs when the questionId changes
  useEffect(() => {
    // window.location.reload();
  }, [currentQuestionIndex]);

  console.log("questionsData", questionsData);
  console.log("currentQuestionIndex", currentQuestionIndex);

  // Set the current question based on the index
  const [currentQuestion, setCurrentQuestion] = useState(
    questionsData[currentQuestionIndex]
  );

  // Set the current question based on the index
  const question = questionsData[currentQuestionIndex];

  // Parse the JSON string into an array of components
  const parsedComponents = JSON.parse(question.components);

  // Map over the array to add a UUID to each component
  const componentsArray = parsedComponents.map((component) => ({
    ...component,
    id: uuidv4(), // Generate a new UUID for each component
  }));
  console.log("componentsArray", componentsArray);

  // Create the questionAnswerPairs array with the current question and answer
  const questionAnswerPairs = 
    {
      question: question.question,
      answer: JSON.parse(question.answer), // Assuming Answer is a JSON string that needs parsing
    }
  ;

  console.log("answerState", answerState);

  const progress = (((currentQuestionIndex + 1) / questionsData.length) * 100) - 25; // Just for demonstration.
  // const progress = 50; // Just for demonstration.
  const devMode = false;
  // const questionAnswerPairs =
  //   {
  //     question: "Draw a voltage divider that splits any input voltage in half",
  //     answer: [[
  //       {
  //         id: "b1",
  //         type: "battery",
  //         value: "10",
  //         ports: ["b1_output", "b1_input"],
  //         connections: [
  //           {
  //             connectedToComponentId: "r2",
  //             connectedToPortId: "output",
  //             portId: "output",
  //           },
  //           {
  //             connectedToComponentId: "r1",
  //             connectedToPortId: "input",
  //             portId: "input",
  //           }
  //         ]
  //       },
  //       {
  //         id: "r2",
  //         type: "resistor",
  //         value: "1000",
  //         ports: ["r2_input", "r2_output"],
  //         connections: [
  //           {
  //             connectedToComponentId: "r1",
  //             connectedToPortId: "output",
  //             portId: "input",
  //           },
  //           {
  //             connectedToComponentId: "b1",
  //             connectedToPortId: "output",
  //             portId: "output",
  //           }
  //         ]
  //       },
  //       {
  //         id: "r1",
  //         type: "resistor",
  //         value: "1000",
  //         ports: ["r1_output", "r1_input"],
  //         connections: [
  //           {
  //             connectedToComponentId: "r2",
  //             connectedToPortId: "input",
  //             portId: "output",
  //           },
  //           {
  //             connectedToComponentId: "b1",
  //             connectedToPortId: "input",
  //             portId: "input",
  //           }
  //         ]
  //       }]
  //     ]
  //   };
  // const currentQuestionIndex = 1;
  // const questionsData = [];

  console.log("questionAnswerPair", questionAnswerPairs);
  console.log("question", questionAnswerPairs.question);

  const handleLinesUpdate = (updatedLines) => {
    setLabelledLines(updatedLines); // Store the updated lines in state
  };

  const handleTestCircuit = (components) => {
    console.log(components.length);
    console.log("components",components);
  
    // Check if there are any components to process
    if (components.length === 0) {
      console.log("No components in the circuit");
      return; // Exit the function early if there are no components
    }
  
    const areAllPortsConnected = () => {

      return components.every(
        (component) => component.connections.length >= component.numberOfPorts
      );
    };
  
    const traceCircuit = (components) => {
      const battery = components.find((comp) => comp.type === "battery");
      if (!battery) {
        console.error("No battery found in the circuit");
        return;
      }
  
      let circuitData = [];
      const visited = new Set();
      const junctions = [];
  
      const tracePath = (currentComponentId, prevComponentId = null) => {
        if (visited.has(currentComponentId)) {
          // If we visit a component we've already visited, it's a junction.
          junctions.push(currentComponentId);
          return;
        }
  
        visited.add(currentComponentId);
        const currentComponent = components.find((comp) => comp.id === currentComponentId);
        if (!currentComponent) {
          console.error("Broken circuit, missing component:", currentComponentId);
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
      //circuitData = circuitData.concat(mappedConnections);
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
      console.log("Some ports are not connected. Please check the circuit and try again.");
      return;
    }
  
    const AllcircuitData = traceCircuit(components);
    const circuitData = AllcircuitData.circuitData

    console.log("Traced Circuit Data:", circuitData);
    console.log("labelledLines FILTER BEFORE", labelledLines);
    function filterLinesWithTo(lines) {
      return lines.filter((line) => line.to);
    }
    var linesWithTo = filterLinesWithTo(labelledLines);
    setLabelledLines(linesWithTo);
    console.log("linesWithTo FILTER AFTER", linesWithTo);
    console.log("labelledLines FILTER AFTER", labelledLines);



    const compareCircuits = (userCircuit, answer) => {
      let discrepancies = [];
    
      // Helper function to summarize connections by component type and value
      const summarizeConnections = (connections, circuit) => {
        return connections.reduce((acc, conn) => {
          const connectedComp = circuit.find(c => c.id === conn.connectedToComponentId);
          if (connectedComp) {
            const key = `${connectedComp.type}:${connectedComp.value}`;
            acc[key] = (acc[key] || 0) + 1;
          }
          return acc;
        }, {});
      };
    
      // Function to compare connection summaries
      const compareSummaries = (summary1, summary2) => {
        const keys1 = Object.keys(summary1);
        const keys2 = Object.keys(summary2);
        if (keys1.length !== keys2.length) return false;
        return keys1.every(key => summary1[key] === summary2[key]);
      };
    
      // Iterate over each user component and check against the answer components
      userCircuit.forEach(userComp => {
        const matches = answer.filter(ansComp => ansComp.type === userComp.type && ansComp.value === userComp.value);
        
        if (matches.length === 0) {
          discrepancies.push({
            id: userComp.id,
            reason: `No matching '${userComp.type}' with value '${userComp.value}' found in the answer.`
          });
          console.log(`No matching '${userComp.type}' with value '${userComp.value}' found in the answer.`)
          return;
        }
    
        const userConnSummary = summarizeConnections(userComp.connections, userCircuit);
        
        const hasMatchingConnections = matches.some(match => {
          const matchConnSummary = summarizeConnections(match.connections, answer);
          return compareSummaries(userConnSummary, matchConnSummary);
        });
    
        if (!hasMatchingConnections) {
          discrepancies.push({
            id: userComp.id,
            reason: `Incorrect connections for '${userComp.type}' with ID '${userComp.id}'.`
          });
          console.log(`Incorrect connections for '${userComp.type}' with ID '${userComp.id}'.`)
        }
      });
    
      // Check for missing components in the user's circuit compared to the answer
      answer.forEach(ansComp => {
        const userComp = userCircuit.find(uc => uc.type === ansComp.type && uc.value === ansComp.value);
        
        if (!userComp) {
          discrepancies.push({
            id: ansComp.id,
            reason: `Missing '${ansComp.type}' with value '${ansComp.value}' in the user's circuit.`
          });
          console.log(`Missing '${ansComp.type}' with value '${ansComp.value}' in the user's circuit.`)
        }
      });
    
      // Deduplicate discrepancies
      discrepancies = discrepancies.reduce((acc, current) => {
        const dup = acc.find(item => item.id === current.id && item.reason === current.reason);
        if (!dup) {
          acc.push(current);
        }
        return acc;
      }, []);
    
      return discrepancies;
    };
    
    
    
// Initialize an array to store discrepancies for each answer
let answerDiscrepancies = [];

questionAnswerPairs.answer.forEach((answer, index) => {
  const discrepancies = compareCircuits(circuitData, answer);
  // Store discrepancies along with the answer index for later reference
  answerDiscrepancies.push({ index, discrepancies });
});

// Sort the discrepancies to find the answer with the fewest issues
answerDiscrepancies.sort((a, b) => a.discrepancies.length - b.discrepancies.length);

// Check if the best match has no discrepancies, implying a correct answer
if (answerDiscrepancies[0].discrepancies.length === 0) {
  setAnswerState("correct");
  console.log("Circuit matches the answer for question:", questionAnswerPairs.question);
} else {
  // If no perfect match, consider the answer with the fewest discrepancies
  setAnswerState("incorrect");
  const bestEffortDiscrepancies = answerDiscrepancies[0].discrepancies;
  const bestEffortAnswerIndex = answerDiscrepancies[0].index;
  console.log("Best effort match found for question:", questionAnswerPairs.question, "with answer index:", bestEffortAnswerIndex, "and discrepancies:", bestEffortDiscrepancies);
  console.log("The answer cloests found was:",questionAnswerPairs.answer[bestEffortAnswerIndex])

  setAnswerMsg(answerDiscrepancies[0].discrepancies)
  
  // Save these discrepancies for feedback through the test button
  // Assuming there's a mechanism to pass these discrepancies to the test button (e.g., a state, a context, etc.)
}

console.log("Answer State:", answerState);

  };
  

  return (
    <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
      <div className="schematicQuestion">
        <Header progress={progress} />
        <div className="content">
          <Instruction text={questionAnswerPairs.question} />
          <Grid
            key={currentQuestionIndex}
            components={components}
            setComponents={setComponents}
            devMode={devMode}
            labelledLines={labelledLines}
            onLinesUpdate={handleLinesUpdate}
            currentQuestionIndex={currentQuestionIndex}
          />
        </div>
        <div className="footer">
          <Toolbar
            key={`toolbar-${currentQuestionIndex}`}
            components={componentsArray}
            answerState={answerState}
            setAnswerState={setAnswerState}
            AnswerMsg={AnswerMsg}
          />
          <TestButton
            key={`testbutton-${currentQuestionIndex}`}
            onTest={() => handleTestCircuit(components)}
            answerState={answerState}
            setAnswerState={setAnswerState}
            questions={questionsData}
            currentQuestionIndex={currentQuestionIndex}
            AnswerMsg={AnswerMsg}
          />
        </div>
      </div>
    </DndProvider>
  );
};

export default SchematicQuestion;
