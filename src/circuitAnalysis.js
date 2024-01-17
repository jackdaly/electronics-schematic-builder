import { matrix, lusolve, zeros } from "mathjs";

export const analyzeCircuit = (circuitData) => {
  // Initialize the graph and nodes data structures
  console.log("circuitData", circuitData);
  const meters = []; // Array to store information about all meters

  // Step 1: Build Node Connection Map
  const nodeConnectionMap = {};
  circuitData.forEach((component) => {
    if (component.type === "meter") {
      console.log(component.connections[0]);
      const nodeId = `${component.id}_${component.connections[0].nodeId}`;
      const connectedNodeId = `${component.connections[0].connectedToComponentId}_${component.connections[0].connectedToNodeId}`;
      console.log("nodeId", nodeId);
      console.log("connectedNodeId", connectedNodeId);
      console.log("before", nodeConnectionMap);
      console.log("nodeConnectionMap[nodeId]", nodeConnectionMap[nodeId]);
      if (!nodeConnectionMap[nodeId]) {
        nodeConnectionMap[nodeId] = new Set();
      } else {
        console.log("not added new set");
      }
      nodeConnectionMap[nodeId].add(connectedNodeId);
      console.log("after", nodeConnectionMap);

      console.log("Meter detected");
      // Collect meter node information
      const meterConnection = component.connections[0];
      meters.push({
        id: `${component.id}_input`,
        ConnectedToid: `${meterConnection.connectedToComponentId}_${meterConnection.connectedToNodeId}`,
        voltage: 0, // Assuming meter voltage is always zero
      });

    } 
      component.connections.forEach((connection) => {
        const nodeId = `${component.id}_${connection.nodeId}`;
        const connectedNodeId = `${connection.connectedToComponentId}_${connection.connectedToNodeId}`;

        if (!nodeConnectionMap[nodeId]) nodeConnectionMap[nodeId] = new Set();
        nodeConnectionMap[nodeId].add(connectedNodeId);

        if (!nodeConnectionMap[connectedNodeId])
          nodeConnectionMap[connectedNodeId] = new Set();
        nodeConnectionMap[connectedNodeId].add(nodeId);
      });
    
    console.log("nodeConnectionMap", nodeConnectionMap);
  });
  const meternodeConnectionMap = nodeConnectionMap;
  console.log("nodeConnectionMap", nodeConnectionMap);
  console.log("Meters", meters);

  //Delete meters from circuitdata
  var circuitData = circuitData.filter((component) => {
    return !meters.some((meter) => meter.id.includes(component.id));
  });

  //loop through meter connections and remove the refernce of the meter.
  const MeternodeConnectionMap = nodeConnectionMap; //Create copy beforehand so we can check.
  const meterNodeIDs = new Set(meters.map((meter) => meter.id));

  // Now, iterate over nodeConnectionMap and remove meter references
  Object.keys(nodeConnectionMap).forEach((nodeId) => {
    // If the nodeId is a meter, delete the entire entry
    if (meterNodeIDs.has(nodeId)) {
      delete nodeConnectionMap[nodeId];
    } else {
      // If the nodeId is not a meter, remove connections to meter nodes
      nodeConnectionMap[nodeId].forEach((connectedNodeId) => {
        if (meterNodeIDs.has(connectedNodeId)) {
          nodeConnectionMap[nodeId].delete(connectedNodeId);
        }
      });

      // If after removal, the set is empty, delete the nodeId entry as well
      if (nodeConnectionMap[nodeId].size === 0) {
        delete nodeConnectionMap[nodeId];
      }
    }
  });

  //Remove any refernce of meters in circuitdata, but log so we can find junctio
  // Extract the IDs of nodes that meters are connected to
  const meterConnectionIds = meters.map((meter) => meter.ConnectedToid);
  console.log(meterConnectionIds);
  //Saved Circuit data

  // Adjust connections in circuitData to remove connections to meters
  circuitData.forEach((component) => {
    component.connections = component.connections.filter((connection) => {
      const isMeterComponent =
        connection.connectedToComponentId.startsWith("m");
      const connectionId = `${component.id}_${connection.connectedToNodeId}`;
      return !(isMeterComponent && meterConnectionIds.includes(connectionId));
    });
  });

  console.log("new circuitData", circuitData);
  console.log("meters", meters);
  console.log("meterConnectionIds", meterConnectionIds);
  console.log("new MeternodeConnectionMap", MeternodeConnectionMap);

  // Step 2: Identify Unique Nodes and Exclude Ground Node
  const uniqueNodes = new Set();
  const visited = new Set();
  const groundNode = "b1_input"; // Assuming 'b1_input' as ground node for this example

  // Assuming 'groundNode' is a variable that holds the identifier for the ground node
  const groundConnections = new Set(); // A set to keep track of nodes connected to ground

  // Modified DFS that adds nodes to groundConnections if they're connected to ground
  const dfs = (node, isGround) => {
    visited.add(node);
    if (isGround) groundConnections.add(node);
    nodeConnectionMap[node].forEach((connectedNode) => {
      if (!visited.has(connectedNode)) {
        dfs(connectedNode, isGround || connectedNode === groundNode);
      }
    });
  };

  // Run DFS for each node and mark nodes connected to ground
  Object.keys(nodeConnectionMap).forEach((node) => {
    if (!visited.has(node)) {
      dfs(node, node === groundNode);
    }
  });

  // Now iterate to add unique nodes, excluding those connected to ground
  Object.keys(nodeConnectionMap).forEach((node) => {
    if (!groundConnections.has(node)) {
      uniqueNodes.add(node); // Only add if it's not connected to ground
    }
  });
  // Helper function to find the root of the node
  const find = (node, parentMap) => {
    if (parentMap[node] !== node) {
      parentMap[node] = find(parentMap[node], parentMap); // Path compression
    }
    return parentMap[node];
  };

  // Helper function to unify two nodes
  const union = (nodeA, nodeB, parentMap) => {
    let rootA = find(nodeA, parentMap);
    let rootB = find(nodeB, parentMap);
    if (rootA !== rootB) {
      parentMap[rootB] = rootA; // Merge the components
    }
  };

  // Main function to process the uniqueNodes and merge them into unique junctions
  const mergeConnectedNodes = (uniqueNodes, nodeConnectionMap) => {
    // Initialize each node's parent to itself
    const parentMap = {};
    uniqueNodes.forEach((node) => {
      parentMap[node] = node;
    });

    // Merge nodes that are directly connected
    uniqueNodes.forEach((node) => {
      nodeConnectionMap[node].forEach((connectedNode) => {
        if (uniqueNodes.has(connectedNode)) {
          union(node, connectedNode, parentMap);
        }
      });
    });

    // Build the set of unique junctions
    const uniqueJunctions = new Set();
    uniqueNodes.forEach((node) => {
      uniqueJunctions.add(find(node, parentMap)); // Add the root of the connected component
    });

    return uniqueJunctions;
  };

  const uniqueJunctions = mergeConnectedNodes(uniqueNodes, nodeConnectionMap);

  console.log("uniqueJunctions", uniqueJunctions);
  // Step 3: Assign Indices to Nodes
  const nodeIndices = {};
  let index = 0;
  uniqueJunctions.forEach((node) => {
    nodeIndices[node] = index++;
  });
  console.log("nodeIndices", nodeIndices);

  //    console.log("Step 1: Build Graph of Components",graph)
  //   // Assign indices to nodes
  //   const nodeIndices = {};
  //   let index = 0;
  //   nodes.forEach(node => {nodeIndices[node] = index++;});

  // ///-----
  const size = index; // Number of non-ground nodes
  //    console.log("Step 2: Identify Nodes",nodes,nodeIndices)

  function findLargerNode(startPin, nodeConnectionMap) {
    const visited = new Set(); // Keep track of visited pins to avoid cycles
    let queue = [startPin]; // Start with the initial pin

    // We will perform a Breadth-First Search (BFS) to find all connected pins
    while (queue.length > 0) {
      const currentPin = queue.shift(); // Dequeue the next pin to process

      // If we've already visited this pin, skip it
      if (visited.has(currentPin)) continue;

      // Mark the current pin as visited
      visited.add(currentPin);

      // Get all pins connected to the current pin
      const connectedPins = nodeConnectionMap[currentPin] || new Set();

      // Enqueue all connected pins that haven't been visited yet
      connectedPins.forEach((pin) => {
        if (!visited.has(pin)) {
          queue.push(pin);
        }
      });
    }

    // After BFS, 'visited' contains all pins that are part of the junction
    // For this function, we can return any pin from the 'visited' set as they all belong to the same junction
    // If the startPin is not part of a larger junction, it's a standalone pin, so we return just the startPin
    return visited.size > 1 ? Array.from(visited) : [startPin];
  }

  // Step 3: Create Matrices
  const G = zeros(size, size);
  const I = zeros(size, 1);
  console.log("start matrix calc ---------------");
  circuitData.forEach((component) => {
    console.log("component", component);
    const type = component.type;
    const value = parseFloat(component.value);
    const nodeConnections = component.connections.map(
      (conn) => `${conn.connectedToComponentId}_${conn.connectedToNodeId}`
    );
    console.log("nodeConnections", nodeConnections);
    if (type === "resistor" && nodeConnections.length === 2) {
      const nodeIndicesPair = nodeConnections.map((connection) => {
        // Check if the connection is part of a recognized node
        if (nodeIndices.hasOwnProperty(connection)) {
          return nodeIndices[connection];
        } else {
          console.log("Else Ran");
          // If not, check if this connection is part of a larger node
          // This requires knowledge of how the nodes were originally identified
          // For example, you may need to look up a map of connection endpoints to their nodes
          var largerNode = findLargerNode(connection, nodeConnectionMap);
          console.log("connection", connection);
          console.log("largerNode", largerNode);
          largerNode = largerNode.filter(function (item) {
            return item !== connection;
          });
          var NodeLarge = largerNode[0];
          console.log("largerNode after", NodeLarge);
          if (nodeIndices[NodeLarge]) {
            return nodeIndices[NodeLarge];
          } else {
            return -1;
          }
        }
      });

      const conductance = 1 / value;
      console.log("nodeIndicesPair ------------", nodeIndicesPair);
      console.log("nodeConnections", nodeConnections);
      // If the resistor is connected to the ground, it will only affect one node in G
      if (nodeIndicesPair.includes(-1)) {
        const nonGroundIndex = nodeIndicesPair.find((index) => index !== -1);
        G._data[nonGroundIndex][nonGroundIndex] += conductance;
      } else if (nodeConnections.indexOf("b1_output") > -1) {
        //known voltage
        console.log("known voltage");
        const [index1, index2] = nodeIndicesPair;
        G._data[index1][0] = 1;

        //Added these as abritary values
        G._data[index2][index2] += conductance;
        G._data[index2][index1] -= conductance;
        ///
      } else {
        console.log("Update G for both nodes");
        // Update G for both nodes
        const [index1, index2] = nodeIndicesPair;
        G._data[index1][index1] += conductance;
        G._data[index2][index2] += conductance;
        G._data[index1][index2] -= conductance;
        G._data[index2][index1] -= conductance;
      }
    } else if (type === "battery") {
      console.log("Its a battery");
      // Update I for the node connected to the positive terminal of the battery
      // Find the identifier for the positive terminal node
      const positiveTerminalConnection = component.connections.find(
        (conn) => conn.nodeId === "output"
      );
      const positiveNodeKey = `${positiveTerminalConnection.connectedToComponentId}_${positiveTerminalConnection.connectedToNodeId}`;
      //console.log("positiveNodeKey",positiveNodeKey,'positiveTerminalConnection',positiveTerminalConnection)
      // Use the formatted key to get the index from nodeIndices
      var positiveNodeIndex = nodeIndices[positiveNodeKey];

      var OtherNode = findLargerNode(positiveNodeKey, nodeConnectionMap);
      //console.log("largerNode", OtherNode);
      OtherNode = OtherNode.filter(function (item) {
        return item !== positiveNodeKey;
      });
      var NodeLarge = OtherNode[0];
      //console.log("largerNode after", NodeLarge);
      positiveNodeIndex = nodeIndices[NodeLarge];

      //console.log("positiveNodeIndex",positiveNodeIndex,component.connections)
      if (positiveNodeIndex !== undefined) {
        //console.log("I._data[positiveNodeIndex][0]",I._data[positiveNodeIndex][0])
        //console.log("value",value)
        I._data[positiveNodeIndex][0] += value;
      }
    }
  });
  console.log("Step 3: Create Matrices", G._data, I._data);
  // Step 4: Solve the matrix equation
  let V;
  try {
    V = lusolve(G, I);
  } catch (error) {
    console.error("Error solving matrix equation: ", error);
    return null;
  }

  // Step 5: Extract Node Voltages
  const nodeVoltages = {};
  Object.keys(nodeIndices).forEach((node) => {
    nodeVoltages[node] = V._data[nodeIndices[node]][0];
  });

  console.log("meterConnectionIds", meterConnectionIds);

  // Before extracting node voltages, find the actual node the meter is connected to
  const findMeterJunction = (meterConnectionIds, meternodeConnectionMap) => {
    let junction = null;
    for (let i = 0; i < meterConnectionIds.length; i++) {
      const MeterToConnection = meterConnectionIds[i];
      const connections = meternodeConnectionMap[MeterToConnection] || [];
      junction = Array.from(connections).find((conn) =>
        uniqueJunctions.has(conn)
      );
    }
    return junction; // This will be the actual node ID that the meter is connected to
  };
  console.log("meterNodeIDs", meterNodeIDs);
  if (meterNodeIDs) {
    console.log("meternodeConnectionMap", meternodeConnectionMap);
    const meterJunction = findMeterJunction(
      meterConnectionIds,
      meternodeConnectionMap
    );
    console.log("meterJunction", meterJunction);
    const AllPotentialConnections = findLargerNode(
      meterJunction,
      nodeConnectionMap
    );
    console.log("AllPotentialConnections", AllPotentialConnections);

    AllPotentialConnections.forEach((connectionId) => {
      if (nodeVoltages.hasOwnProperty(connectionId)) {
        console.log("connectionId", connectionId);
        // Find and update the corresponding meter
        meters[0].voltage = nodeVoltages[connectionId];
        // meters.forEach(meter => {
        //   if (meter.ConnectedToid.hasOwnProperty(connectionId)) {
        //     meter.voltage = nodeVoltages[connectionId];
        //   }
        // });
      }
    });
  }

  // Add ground node voltage
  nodeVoltages["ground"] = 0;

  console.log(nodeVoltages);
  console.log("meters", meters);
  let Answer;
  let error = [];
  if (meters.length) {
    //Meters exist
    const Answer = meters[0].voltage;
    return Answer, error;
  } else {
    error.push("Try adding a meter to measure the answer");
    return Answer, error;
  }
};

// export const analyzeCircuit = (circuitData) => {
//   console.log("circuitData",circuitData)
//   // Step 1: Build Graph of Components
//   const graph = new Map();
//   circuitData.forEach((component) => {
//     component.connections.forEach((connection) => {
//       if (!graph.has(component.id)) {
//         graph.set(component.id, []);
//       }
//       graph.get(component.id).push({
//         toComponentId: connection.connectedToComponentId,
//         toNodeId: connection.connectedToNodeId,
//         fromNodeId: connection.nodeId,
//       });
//     });
//   });
//   console.log("Step 1: Build Graph of Components",graph)
//   // Step 2: Identify Nodes
//   const nodes = new Set();
//   graph.forEach((edges, componentId) => {
//     edges.forEach((edge) => {
//       nodes.add(componentId + "_" + edge.fromNodeId);
//       nodes.add(edge.toComponentId + "_" + edge.toNodeId);
//     });
//   });

//   const nodeNumbers = {};
//   let counter = 0;
//   nodes.forEach((node) => {
//     nodeNumbers[node] = counter++;
//   });

//   const size = Object.keys(nodeNumbers).length;
//   console.log("Step 2: Identify Nodes",nodes)
//   // Step 3: Create Matrices
//   const G = zeros(size, size);
//   const I = zeros(size, 1);

//   circuitData.forEach((component) => {
//     const type = component.type;
//     const value = parseFloat(component.value);
//     const connections = component.connections.map(
//       (conn) =>
//         nodeNumbers[conn.connectedToComponentId + "_" + conn.connectedToNodeId]
//     );

//     if (type === "resistor") {
//       const conductance = 1 / value; // Since value is resistance in ohms
//       connections.forEach((node, idx) => {
//         if (node !== undefined) {
//           G._data[node][node] += conductance; // Add to diagonal
//           connections.forEach((otherNode, otherIdx) => {
//             if (otherIdx !== idx && otherNode !== undefined) {
//               G._data[node][otherNode] -= conductance; // Subtract from off-diagonal
//             }
//           });
//         }
//       });
//     } else if (type === "battery") {
//       const voltage = value; // Since value is voltage in volts;
//       if (connections.length === 2) {
//         const [node1, node2] = connections;
//         if (node1 !== undefined && node2 !== undefined) {
//           // Update I (current source vector) for voltage source
//           I._data[node1][0] -= voltage;
//           I._data[node2][0] += voltage;
//         }
//       }
//     }
//   });
//   console.log("Step 3: Create Matrices",G._data,I._data)
//   // Step 4: Solve the Matrix Equation
//   console.log("Step 4: Solve the Matrix Equation")
//   let V;
//   try {
//     V = lusolve(G, I);
//   } catch (error) {
//     console.error("Error solving matrix equation: ", error);
//     return null; // Return null in case of an error (e.g., singular matrix)
//   }

//   // Step 5: Extract Node Voltages
//   const nodeVoltages = {};
//   Object.keys(nodeNumbers).forEach((node) => {
//     nodeVoltages[node] = V._data[nodeNumbers[node]][0];
//   });
// console.log("Step 5: Extract Node Voltages",nodeVoltages)
//   return nodeVoltages;
// }

export default analyzeCircuit;

// export const analyzeCircuit = (circuitData) => {
//   // Set up the coefficient matrix (A) and constant matrix (b) for Ax = b
//   let A = []; // Initialize an empty array for the coefficients.
//   let b = []; // Initialize an empty array for the constants.

//   // Example circuitData format expected:
//   // [
//   //   { id: 'b1', type: 'battery', value: '10', connections: [...] },
//   //   { id: 'r1', type: 'resistor', value: '1000', connections: [...] },
//   //   ...
//   // ]

//   // Assume all resistances are in ohms and voltage sources are in volts.
//   // Assume 'circuitData' is an array of objects where each object represents a component and its connections.

//   // You will need to identify all the nodes in the circuit and assign a variable for the voltage at each node.
//   // Here we'll assume a function `setupEquations` that does this for us.
//   // This is a complex task that involves understanding the structure of the circuit.
//   // The `setupEquations` function is not implemented here and would need to be defined based on your application's needs.

//   // Create nodeMap based on circuitData
//   let nodeCounter = 0;
//   const nodeMap = {};
//   // The reference node is usually the negative side of the battery or ground.
//   // You need to ensure the reference node is excluded from the nodeMap and nodeVoltages.
//   // For simplicity, we're assuming the first connection of the battery is the reference node.
//   const referenceNodeKey = `${
//     circuitData.find((c) => c.type === "battery").id
//   }_input`;

//   console.log("circuitData", circuitData);

//   circuitData.forEach((component) => {
//     component.connections.forEach((conn) => {
//       // Use the component's ID and the node type ('input' or 'output') to create a unique key
//       const key = `${component.id}_${conn.nodeId}`;
//       console.log("key", key);
//       if (`${component.id}_${conn.nodeId}` === referenceNodeKey) {
//         return; // Skip this connection as it is to the reference node
//       }

//       if (
//         conn.connectedToComponentId &&
//         `${conn.connectedToComponentId}_${conn.connectedToNodeId}` !==
//           referenceNodeKey
//       ) {
//         // If it's connected, then we check if the connected component's connection already has a node
//         const connectedKey = `${conn.connectedToComponentId}_${conn.connectedToNodeId}`;
//         // If neither connection is registered, we have a new node at this junction
//         if (
//           !nodeMap.hasOwnProperty(key) &&
//           !nodeMap.hasOwnProperty(connectedKey)
//         ) {
//           // Assign a new node index to both sides of the connection
//           nodeMap[key] = nodeCounter;
//           nodeMap[connectedKey] = nodeCounter;
//           // Mark this connection as part of the node
//           nodeMap[key] = nodeCounter;
//           nodeMap[connectedKey] = nodeCounter;
//           // Increment node counter after assigning a new node
//           nodeCounter++;
//         } else {
//           // If one side of the connection is already registered, use the same node index for the new side
//           const existingNodeIndex = nodeMap[connectedKey] || nodeMap[key];
//           nodeMap[key] = existingNodeIndex;
//           nodeMap[connectedKey] = existingNodeIndex;
//           // Mark this connection as part of the existing node
//           nodeMap[key] = existingNodeIndex;
//           nodeMap[connectedKey] = existingNodeIndex;
//         }
//       }
//     });
//   });

//   // Initialize the A matrix and b vector with zeros
//   const size = Object.keys(nodeMap).length / 2;
//   console.log("size", size);
//   for (let i = 0; i < size; i++) {
//     A.push(new Array(size).fill(0));
//     b.push(0);
//   }
//   console.log("Before", A, b);
//   console.log("nodeMap", nodeMap);

//   const result = setupEquations(circuitData, A, b, nodeMap);
//   A = result.A;
//   b = result.b;

//   console.log("After", A, b);

//   // Solve the linear equations Ax = b for the node voltages x
//   let nodeVoltages;
//   try {
//     const A_matrix = math.matrix(A);
//     const b_matrix = math.matrix(b);
//     console.log("Matrix ", A_matrix, b_matrix);
//     nodeVoltages = math.lusolve(A_matrix, b_matrix);
//     console.log("nodeVoltages ", nodeVoltages);
//   } catch (error) {
//     console.error("Failed to solve circuit equations:", error);
//     return null; // Return null or an appropriate error indicator
//   }

//   // Calculate current through each component using Ohm's Law: V = IR
//   // Again, we'll need to loop through each component and use the node voltages to calculate the currents.
//   // Note: This example assumes a simple circuit where components are only connected in series.
//   const componentCurrents = circuitData.map((component) => {
//     if (component.type === "resistor") {
//       // Find the voltages at the nodes this resistor is connected to
//       const nodeAIndex = component.connections[0].nodeId; // nodeId should be the index or identifier to get voltage from nodeVoltages
//       const nodeBIndex = component.connections[1].nodeId;
//       const voltageA = nodeVoltages[nodeAIndex];
//       const voltageB = nodeVoltages[nodeBIndex];
//       const voltageAcross = voltageA - voltageB;

//       // Ohm's Law to find current: I = V/R
//       const current = voltageAcross / component.value; // component.value is the resistance
//       return { id: component.id, current };
//     } else {
//       // For a voltage source, we assume current direction and value are given by the problem setup
//       // Here, you would need additional logic to determine the current based on the circuit configuration
//       return { id: component.id, current: null }; // Placeholder
//     }
//   });

//   // Return the analysis results
//   return {
//     nodeVoltages: nodeVoltages.toArray(), // Convert to regular array if necessary
//     componentCurrents,
//   };
// };
// /*
// function setupEquations(circuitData, A, b, nodeMap) {
//   circuitData.forEach((component) => {
//     if (component.type === "resistor") {
//       console.log("Working Through ", component, "-------------");

//       // Get the node indices for the connections of the resistor

//       console.log("component.connections", component.connections);
//       console.log("nodeMap", nodeMap);
//       const nodeIndices = component.connections
//         .map((conn) => {
//           // Use the connected component ID and node ID to find the correct node index.
//           if (conn.connectedToComponentId && conn.connectedToNodeId) {
//             console.log(
//               conn.connectedToComponentId,
//               conn.connectedToNodeId,
//               "IF Ran",
//               nodeMap[
//                 `${conn.connectedToComponentId}_${conn.connectedToNodeId}`
//               ]
//             );

//             return nodeMap[
//               `${conn.connectedToComponentId}_${conn.connectedToNodeId}`
//             ];
//           }
//           console.log(
//             "Conn ID ",
//             conn.connectedToComponentId,
//             conn.connectedToNodeId
//           );
//           return undefined;
//         })
//         .filter((index) => index !== undefined); // Filter out any undefined indices.
//       console.log("nodeIndices", nodeIndices);

//       if (nodeIndices.length === 2) {
//         const resistance = parseFloat(component.value);
//         const conductance = 1 / resistance;

//         // Update the A matrix
//         // Diagonal entries
//         console.log("Updating diagonal entries");
//         A[nodeIndices[0]][nodeIndices[0]] += conductance;
//         A[nodeIndices[1]][nodeIndices[1]] += conductance;

//         // Off-diagonal entries
//         A[nodeIndices[0]][nodeIndices[1]] -= conductance;
//         A[nodeIndices[1]][nodeIndices[0]] -= conductance;
//       } else if (nodeIndices.length === 1) {
//         const resistance = parseFloat(component.value);
//         const conductance = 1 / resistance;
//         //Only connected to one node therefore
//         console.log("Updating A matrix for a resistor connected to ground");
//         A[nodeIndices[0]][nodeIndices[0]] += conductance;
//       }
//     } else if (component.type === "battery") {
//       console.log("battery");
//       // Assuming battery's positive terminal is 'output'
//       const batteryNodeIndex = nodeMap[`${component.id}_output`];
//       console.log("batteryNodeIndex", batteryNodeIndex);
//       if (batteryNodeIndex !== undefined) {
//         // Zero out the entire row for this node index
//         A[batteryNodeIndex].fill(0);
//         // Set the diagonal to 1
//         A[batteryNodeIndex][batteryNodeIndex] = 1;
//         // Set the corresponding value in b to the voltage of the battery
//         b[batteryNodeIndex] = parseFloat(component.value);
//       } else {
//         console.error("Battery positive terminal node index undefined.");
//       }

//       // // Find the resistor connected to the battery's output
//       // const connectedResistor = circuitData.find((c) => {
//       //   return c.connections.some((conn) => {
//       //     return (
//       //       conn.connectedToComponentId === component.id &&
//       //       conn.connectedToNodeId === "output"
//       //     );
//       //   });
//       // });

//       // if (connectedResistor && connectedResistor.type === "resistor") {
//       //   const resistanceValue = parseFloat(connectedResistor.value);
//       //   const voltage = parseFloat(component.value);
//       //   b[batteryNodeIndex] = voltage; // Divide by the resistance value
//       // } else {
//       //   console.error(
//       //     "No resistor found connected to battery output or invalid circuit data."
//       //   );
//       // }
//     }
//     console.log("FINISHED ", component, "-------------");
//   });

//   return { A, b };
// }*/

// function setupEquations(circuitData, A, b, nodeMap) {
//   const voltageSourceNodes = new Set(); // Keep track of nodes with fixed voltages from voltage sources
//   const referenceNodeKey = "b1_input";
//   circuitData.forEach((component) => {
//     if (component.type === "battery") {
//       console.log(component);
//       // For a battery, set the row in matrix A corresponding to the positive terminal to have all zeros except for a 1 in the diagonal position.
//       const batteryPositiveNodeIndex = nodeMap[`${component.id}_output`];
//       if (batteryPositiveNodeIndex !== undefined) {
//         // Zero out the entire row for this node index
//         A[batteryPositiveNodeIndex].fill(0);
//         // Set the diagonal to 1
//         A[batteryPositiveNodeIndex][batteryPositiveNodeIndex] = 1;
//         // Set the corresponding value in b to the voltage of the battery
//         b[batteryPositiveNodeIndex] = parseFloat(component.value);

//         // Mark this node as having a fixed voltage due to being connected to a voltage source
//         voltageSourceNodes.add(batteryPositiveNodeIndex);
//       } else {
//         console.error("Battery positive terminal node index undefined.");
//       }
//     }
//     // ... other component handling ...
//   });
//   console.log("complete voltage source, now ressistor")
//   // After handling all voltage sources, go through resistors and update matrices
//   circuitData.forEach((component) => {
//     if (component.type === "resistor") {
//       console.log(component);
//       // Get the node indices for the connections of the resistor
//       const nodeIndices = component.connections
//         .map((conn) => {
//           if (conn.connectedToComponentId && conn.connectedToNodeId) {
//             return nodeMap[
//               `${conn.connectedToComponentId}_${conn.connectedToNodeId}`
//             ];
//           }
//           return undefined;
//         })
//         .filter((index) => index !== undefined); // Filter out any undefined indices.
// console.log(nodeIndices)
//       // If the resistor is not connected to a voltage source node, update the A matrix
//       if (
//         !voltageSourceNodes.has(nodeIndices[0]) &&
//         !voltageSourceNodes.has(nodeIndices[1])
//       ) {
//         if (nodeIndices[0] !== undefined && nodeIndices[1] !== undefined) {
//           console.log("Run as usual")
//           const resistance = parseFloat(component.value);
//           const conductance = 1 / resistance;

//           // Update the A matrix
//           // Diagonal entries
//           A[nodeIndices[0]][nodeIndices[0]] += conductance;
//           A[nodeIndices[1]][nodeIndices[1]] += conductance;

//           // Off-diagonal entries
//           A[nodeIndices[0]][nodeIndices[1]] -= conductance;
//           A[nodeIndices[1]][nodeIndices[0]] -= conductance;

//           // Update the A matrix
//           if (!voltageSourceNodes.has(nodeIndices[0])) {
//             A[nodeIndices[0]][nodeIndices[0]] += conductance;
//             // If the second node is not the reference node, update the off-diagonal entry
//             if (`${component.id}_input` !== referenceNodeKey) {
//               A[nodeIndices[0]][nodeIndices[1]] -= conductance;
//             }
//           }

//           if (!voltageSourceNodes.has(nodeIndices[1])) {
//             A[nodeIndices[1]][nodeIndices[1]] += conductance;
//             // If the first node is not the reference node, update the off-diagonal entry
//             if (`${component.id}_output` !== referenceNodeKey) {
//               A[nodeIndices[1]][nodeIndices[0]] -= conductance;
//             }
//           }
//         } else {
//           console.log("Handle cases where one of the nodes is the reference node")
//           // Handle cases where one of the nodes is the reference node
//           const resistance = parseFloat(component.value);
//           const conductance = 1 / resistance;
//           const validNodeIndex =
//             nodeIndices[0] !== undefined ? nodeIndices[0] : nodeIndices[1];

//           // Only update the diagonal entry for the non-reference node
//           if (
//             validNodeIndex !== undefined &&
//             !voltageSourceNodes.has(validNodeIndex)
//           ) {
//             A[validNodeIndex][validNodeIndex] += conductance;
//           }
//         }
//       } else {
//         console.log("connected to a voltage source")

//         if (!voltageSourceNodes.has(nodeIndices[0])){
//           //not node connected
//         }
//         else if (!voltageSourceNodes.has(nodeIndices[1])){
//           //not node connected
//         }
//         else{
//           return
//         }
//         // If one of the nodes is connected to a voltage source,
//         // we do not update the A matrix because its voltage is already determined by the voltage source.
//         // However, we might need to handle the current flowing through the resistor due to the voltage source in a more complex circuit.
//       }
//     }
//   });

//   return { A, b };
// }

// /*
// function setupEquations(circuitData, A, b, nodeMap) {
//   const referenceNodeKey = "b1_input";
//   console.log("nodeMap", nodeMap);

//   // Set up the equations based on the components
//   circuitData.forEach((component, index) => {
//     console.log(`Processing component:`, component);

//     component.connections.forEach((conn) => {
//       // Construct the key for this connection
//       const key = `${component.id}_${conn.nodeId}`;

//       console.log(key);

//       // Check if this connection is to the reference node and skip it
//       if (key === referenceNodeKey) {
//         console.log("Skip: ", key);
//         return; // Skip the reference node
//       }

//       // Ensure the nodeMap contains a valid entry for this connection
//       const nodeIndex = nodeMap[key];
//       if (nodeIndex === undefined) {
//         console.error(`nodeMap does not contain a key for: ${key}`);
//         return; // Exit this iteration if nodeMap key is undefined
//       }

//       // Get the node indices for the resistor connections
//       let nodeAIndex = nodeIndex; // Index for the current node
//       let nodeBIndex; // Index for the node connected to the current node

//       // Check if the connected node is not the reference node
//       const connectedNodeKey = `${conn.connectedToComponentId}_${conn.connectedToNodeId}`;
//       if (connectedNodeKey !== referenceNodeKey) {
//         nodeBIndex = nodeMap[connectedNodeKey];
//         if (nodeBIndex === undefined) {
//           console.error(
//             `nodeMap does not contain a key for: ${connectedNodeKey}`
//           );
//           return; // Exit this iteration if nodeMap key is undefined
//         }
//       }

//       if (component.type === "resistor") {
//         console.log("resistor");
//         const resistance = parseFloat(component.value);
//         console.log("resistance", resistance);

//         if (nodeAIndex !== undefined) {
//           console.log("HERE nodeAIndex", nodeAIndex);
//           console.log("A[nodeAIndex][nodeAIndex]", A[nodeAIndex][nodeAIndex]);
//           console.log("A", A);
//           console.log(1 / resistance);
//           A[nodeAIndex][nodeAIndex] =
//             A[nodeAIndex][nodeAIndex] + 1 / resistance; // Add 1/R to the diagonal of node A in matrix A
//           console.trace("A", A);
//           console.log(`Snapshot of A matrix at index [${nodeAIndex}][${nodeAIndex}]:`, JSON.parse(JSON.stringify(A)));
//           console.log("AAFTER [nodeAIndex][nodeAIndex]", A[nodeAIndex][nodeAIndex]);
//         } else {
//           console.error(`Undefined nodeAIndex for key: ${key}`);
//         }

//         console.log("nodeBIndex", nodeBIndex);
//         if (nodeBIndex !== undefined) {
//           A[nodeBIndex][nodeBIndex] += 1 / resistance; // Add 1/R to the diagonal of node B in matrix A
//           // Since it's a resistor between two nodes, we must subtract 1/R from the off-diagonals
//           A[nodeAIndex][nodeBIndex] -= 1 / resistance;
//           A[nodeBIndex][nodeAIndex] -= 1 / resistance;
//         } else {
//           console.error(`Undefined nodeBIndex for key: ${key}`);
//         }

//       } else if (
//         component.type === "battery" &&
//         component.connections.length === 2
//       ) {
//         // Check the connections to ensure we have an 'output' and an 'input' node
//         const outputConnection = component.connections.find(
//           (conn) => conn.nodeId === "output"
//         );
//         const inputConnection = component.connections.find(
//           (conn) => conn.nodeId === "input"
//         );

//         // The outputConnection is positive, inputConnection is negative (reference)
//         // Thus, we only need to update the equation for the output node
//         if (outputConnection && inputConnection) {
//           const outputNodeIndex = nodeMap[`${component.id}_output`];
//           const voltage = parseFloat(component.value);

//           // A voltage source impacts the b vector, not the A matrix
//           // It sets up a fixed voltage difference between the output node and the reference node
//           if (outputNodeIndex !== undefined) {
//             b[outputNodeIndex] += voltage; // Increase b at output node by voltage value
//           } else {
//             console.error(
//               `Undefined outputNodeIndex for key: ${outputNodeIndex}`
//             );
//           }
//         } else {
//           console.error(
//             `Battery ${component.id} does not have both 'output' and 'input' nodes defined.`
//           );
//         }
//       }
//     });

//     // Add additional else if statements here to handle other types of components
//   });

//   console.log("a/b", A, b);
//   return { A, b };
// }
// */
