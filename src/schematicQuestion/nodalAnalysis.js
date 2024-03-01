import * as math from "mathjs";

let circuit;

// variable declaration
let resistor_list = [];
let curr_src_list = [];
let volt_src_list = [];
let vccs_list = [];
let vcvs_list = [];
let cccs_gen_list = [];
let cccs_vs_list = [];
let ccvs_gen_list = [];
let ccvs_vs_list = [];

let connection_list = [];
let element_id_list = [];
let element_type_list = [];
let connection_id_list = [];
let raw_nodes_list = [];

let nodes_list = [];
let added_list = [];

//Declaring classes for components:

class connection {
  constructor(conn_id, label_id, label_text, src_node, tar_node) {
    this.conn_id = conn_id;
    this.label_id = label_id;
    this.label_text = label_text;
    this.src_node = src_node;
    this.tar_node = tar_node;
  }
}
class resistor {
  constructor(
    id,
    label_id,
    inp_port_id,
    out_port_id,
    label,
    node_k,
    node_l,
    ele_code
  ) {
    this.id = id;
    this.label_id = label_id;
    this.inp_port_id = inp_port_id;
    this.out_port_id = out_port_id;
    this.label = label;
    this.node_k = node_k;
    this.node_l = node_l;
    this.ele_code = 1;
  }
}
class curr_src {
  constructor(
    id,
    label_id,
    inp_port_id,
    out_port_id,
    label,
    node_k,
    node_l,
    ele_code
  ) {
    this.id = id;
    this.label_id = label_id;
    this.inp_port_id = inp_port_id;
    // ## Here inp_port is the low
    this.out_port_id = out_port_id;
    // ## Here out_port is the high
    this.label = label;
    this.node_k = node_k;
    // ## The final node numbers to be used directly in our version 1 algo
    this.node_l = node_l;
    // ## The final node numbers to be used directly in our version 1 algo
    this.ele_code = 2;
  }
}

class volt_src {
  constructor(
    id,
    label_id,
    inp_port_id,
    out_port_id,
    label,
    node_k,
    node_l,
    ele_code
  ) {
    this.id = id;
    this.label_id = label_id;
    this.inp_port_id = inp_port_id;
    // ## Here inp_port is the low
    this.out_port_id = out_port_id;
    // ## Here out_port is the high
    this.label = label;
    this.node_k = node_k;
    // ## The final node numbers to be used directly in our version 1 algo
    this.node_l = node_l;
    // ## The final node numbers to be used directly in our version 1 algo
    this.ele_code = 3;
  }
}

class volt_cont_curr_src {
  constructor(
    id,
    label_id,
    inp_port_id,
    out_port_id,
    label,
    node_k,
    node_l,
    cont_high_node,
    cont_low_node,
    node_m,
    node_n,

    ele_code
  ) {
    this.id = id;
    this.label_id = label_id;
    this.inp_port_id = inp_port_id;
    // ## Here inp_port is the low
    this.out_port_id = out_port_id;
    // ## Here out_port is the high
    this.label = label;
    this.node_k = node_k;
    // ## The final node numbers to be used directly in our version 1 algo
    this.node_l = node_l;
    // ## The final node numbers to be used directly in our version 1 algo
    this.cont_high_node = cont_high_node;
    this.cont_low_node = cont_low_node;
    this.node_m = node_m;
    this.node_n = node_n;
    this.m_changed = 0;
    this.n_changed = 0;
    this.ele_code = 4;
  }
}

class volt_cont_volt_src {
  constructor(
    id,
    label_id,
    inp_port_id,
    out_port_id,
    label,
    node_k,
    node_l,
    cont_high_node,
    cont_low_node,
    node_m,
    node_n,

    ele_code
  ) {
    this.id = id;
    this.label_id = label_id;
    this.inp_port_id = inp_port_id;
    // ## Here inp_port is the low
    this.out_port_id = out_port_id;
    // ## Here out_port is the high
    this.label = label;
    this.node_k = node_k;
    // ## The final node numbers to be used directly in our version 1 algo
    this.node_l = node_l;
    // ## The final node numbers to be used directly in our version 1 algo
    this.cont_high_node = cont_high_node;
    this.cont_low_node = cont_low_node;
    this.node_m = node_m;
    this.node_n = node_n;
    this.m_changed = 0;
    this.n_changed = 0;
    this.ele_code = 5;
  }
}

class curr_cont_curr_src_gen {
  constructor(
    id,
    label_id,
    inp_port_id,
    out_port_id,
    label,
    node_k,
    node_l,
    cont_high_node,
    cont_low_node,
    node_m,
    node_n,

    ele_code
  ) {
    this.id = id;
    this.label_id = label_id;
    this.inp_port_id = inp_port_id;
    // ## Here inp_port is the low
    this.out_port_id = out_port_id;
    // ## Here out_port is the high
    this.label = label;
    this.node_k = node_k;
    // ## The final node numbers to be used directly in our version 1 algo
    this.node_l = node_l;
    // ## The final node numbers to be used directly in our version 1 algo
    this.cont_high_node = cont_high_node;
    this.cont_low_node = cont_low_node;
    this.node_m = node_m;
    this.node_n = node_n;
    this.m_changed = 0;
    this.n_changed = 0;
    this.ele_code = 6;
  }
}

class curr_cont_curr_src_vs {
  constructor(
    id,
    label_id,
    inp_port_id,
    out_port_id,
    label,
    node_k,
    node_l,
    cont_high_node,
    cont_low_node,
    node_m,
    node_n,

    ele_code
  ) {
    this.id = id;
    this.label_id = label_id;
    this.inp_port_id = inp_port_id;
    // ## Here inp_port is the low
    this.out_port_id = out_port_id;
    // ## Here out_port is the high
    this.label = label;
    this.node_k = node_k;
    // ## The final node numbers to be used directly in our version 1 algo
    this.node_l = node_l;
    // ## The final node numbers to be used directly in our version 1 algo
    this.cont_high_node = cont_high_node;
    this.cont_low_node = cont_low_node;
    this.node_m = node_m;
    this.node_n = node_n;
    this.m_changed = 0;
    this.n_changed = 0;
    this.ele_code = 7;
  }
}

class curr_cont_volt_src_gen {
  constructor(
    id,
    label_id,
    inp_port_id,
    out_port_id,
    label,
    node_k,
    node_l,
    cont_high_node,
    cont_low_node,
    node_m,
    node_n,

    ele_code
  ) {
    this.id = id;
    this.label_id = label_id;
    this.inp_port_id = inp_port_id;
    // ## Here inp_port is the low
    this.out_port_id = out_port_id;
    // ## Here out_port is the high
    this.label = label;
    this.node_k = node_k;
    // ## The final node numbers to be used directly in our version 1 algo
    this.node_l = node_l;
    // ## The final node numbers to be used directly in our version 1 algo
    this.cont_high_node = cont_high_node;
    this.cont_low_node = cont_low_node;
    this.node_m = node_m;
    this.node_n = node_n;
    this.m_changed = 0;
    this.n_changed = 0;
    this.ele_code = 8;
  }
}

class curr_cont_volt_src_vs {
  constructor(
    id,
    label_id,
    inp_port_id,
    out_port_id,
    label,
    node_k,
    node_l,
    cont_high_node,
    cont_low_node,
    node_m,
    node_n,

    ele_code
  ) {
    this.id = id;
    this.label_id = label_id;
    this.inp_port_id = inp_port_id;
    // ## Here inp_port is the low
    this.out_port_id = out_port_id;
    // ## Here out_port is the high
    this.label = label;
    this.node_k = node_k;
    // ## The final node numbers to be used directly in our version 1 algo
    this.node_l = node_l;
    // ## The final node numbers to be used directly in our version 1 algo
    this.cont_high_node = cont_high_node;
    this.cont_low_node = cont_low_node;
    this.node_m = node_m;
    this.node_n = node_n;
    this.m_changed = 0;
    this.n_changed = 0;
    this.ele_code = 9;
  }
}

//End of declaring components

// Function for return element type from id
function ret_type_from_id(id) {
  return element_type_list[element_id_list.indexOf(id)];
}

// Function that returns the source and target nodes given id
function ret_source_target_nodes_from_id(id, port_type) {
  console.log("port_type", port_type);
  var ele_type = ret_type_from_id(id);
  if (ele_type == "Resistor") {
    for (var i = 0; i < resistor_list.length; i++) {
      if (resistor_list[i].id == id) {
        if (port_type == "hybrid0") {
          return resistor_list[i].inp_port_id;
        } else if (port_type == "hybrid1") {
          return resistor_list[i].out_port_id;
        }
      }
    }
  } else if (ele_type == "CurrentSource") {
    for (var i = 0; i < curr_src_list.length; i++) {
      if (curr_src_list[i].id == id) {
        if (port_type == "hybrid0") {
          return curr_src_list[i].inp_port_id;
        } else if (port_type == "hybrid1") {
          return curr_src_list[i].out_port_id;
        }
      }
    }
  } else if (ele_type == "VoltageSource") {
    for (var i = 0; i < volt_src_list.length; i++) {
      if (volt_src_list[i].id == id) {
        if (port_type == "hybrid0") {
          return volt_src_list[i].inp_port_id;
        } else if (port_type == "hybrid1") {
          return volt_src_list[i].out_port_id;
        }
      }
    }
  } else if (ele_type == "VCCS") {
    for (var i = 0; i < vccs_list.length; i++) {
      if (vccs_list[i].id == id) {
        if (port_type == "hybrid0") {
          return vccs_list[i].inp_port_id;
        } else if (port_type == "hybrid1") {
          return vccs_list[i].out_port_id;
        }
      }
    }
  } else if (ele_type == "VCVS") {
    for (var i = 0; i < vcvs_list.length; i++) {
      if (vcvs_list[i].id == id) {
        if (port_type == "hybrid0") {
          return vcvs_list[i].inp_port_id;
        } else if (port_type == "hybrid1") {
          return vcvs_list[i].out_port_id;
        }
      }
    }
  } else if (ele_type == "CCCS_Gen") {
    for (var i = 0; i < cccs_gen_list.length; i++) {
      if (cccs_gen_list[i].id == id) {
        if (port_type == "hybrid0") {
          return cccs_gen_list[i].inp_port_id;
        } else if (port_type == "hybrid1") {
          return cccs_gen_list[i].out_port_id;
        }
      }
    }
  } else if (ele_type == "CCCS_Vs") {
    for (var i = 0; i < cccs_vs_list.length; i++) {
      if (cccs_vs_list[i].id == id) {
        if (port_type == "hybrid0") {
          return cccs_vs_list[i].inp_port_id;
        } else if (port_type == "hybrid1") {
          return cccs_vs_list[i].out_port_id;
        }
      }
    }
  } else if (ele_type == "CCVS_Gen") {
    for (var i = 0; i < ccvs_gen_list.length; i++) {
      if (ccvs_gen_list[i].id == id) {
        if (port_type == "hybrid0") {
          return ccvs_gen_list[i].inp_port_id;
        } else if (port_type == "hybrid1") {
          return ccvs_gen_list[i].out_port_id;
        }
      }
    }
  } else if (ele_type == "CCVS_Vs") {
    for (var i = 0; i < ccvs_vs_list.length; i++) {
      if (ccvs_vs_list[i].id == id) {
        if (port_type == "hybrid0") {
          return ccvs_vs_list[i].inp_port_id;
        } else if (port_type == "hybrid1") {
          return ccvs_vs_list[i].out_port_id;
        }
      }
    }
  }
}
function return_node_num_from_port_id(port_id) {
  for (var i = 0; i < nodes_list.length; i++) {
    if (nodes_list[i][1].includes(port_id)) {
      return nodes_list[i][0];
    }
  }
}
function ret_src_tar_node_from_conn_label(text) {
  for (var i = 0; i < connection_list.length; i++) {
    if (connection_list[i].label_text == text) {
      return [connection_list[i].src_node, connection_list[i].tar_node];
    }
  }
}
function ret_node_m_or_n(text) {
  var res = ret_src_tar_node_from_conn_label(text);
  var p1 = return_node_num_from_port_id(res[0]);
  var p2 = return_node_num_from_port_id(res[1]);
  if (p1 == p2) {
    return p1;
  }
}

function generate_node_list() {
  var nodes_list = [];
  var added_list = [];
  var cnt = 1;
  connection_list.forEach((conn) => {
    if (nodes_list.length == 0) {
      nodes_list.push([0, [conn.src_node, conn.tar_node]]);
      added_list.push(conn.src_node);
      added_list.push(conn.tar_node);
    } else if (
      added_list.includes(conn.src_node) == false &&
      added_list.includes(conn.tar_node)
    ) {
      nodes_list.forEach((n) => {
        if (n[1].includes(conn.tar_node)) {
          n[1].push(conn.src_node);
          added_list.push(conn.src_node);
        }
      });
    } else if (
      added_list.includes(conn.tar_node) == false &&
      added_list.includes(conn.src_node)
    ) {
      nodes_list.forEach((n) => {
        if (n[1].includes(conn.src_node)) {
          n[1].push(conn.tar_node);
          added_list.push(conn.tar_node);
        }
      });
    } else {
      nodes_list.push([cnt, [conn.src_node, conn.tar_node]]);
      added_list.push(conn.src_node);
      added_list.push(conn.tar_node);
      cnt += 1;
    }
  });
  for (var i = 0; i < nodes_list.length; i++) {
    for (var j = 0; j < nodes_list.length - i - 1; j++) {
      if (nodes_list[j][1].length > nodes_list[j + 1][1].length) {
        var temp = nodes_list[j];
        nodes_list[j] = nodes_list[j + 1];
        nodes_list[j + 1] = temp;
      }
    }
  }
  nodes_list.reverse();
  for (var i = 0; i < nodes_list.length; i++) {
    nodes_list[i][0] = i;
  }
  console.log("nodes_list Before", nodes_list);

  // Find the index of the node group that contains 'b1_input'
  var groundNodeIndex = nodes_list.findIndex((group) =>
    group[1].includes("b1_input")
  );

  // If 'b1_input' is found in the nodes_list
  if (groundNodeIndex !== -1) {
    // Move the ground node to the first position
    var groundNodeGroup = nodes_list.splice(groundNodeIndex, 1)[0];
    nodes_list.unshift(groundNodeGroup);
  }

  // Reassign sequential index to each group in nodes_list
  for (var i = 0; i < nodes_list.length; i++) {
    nodes_list[i][0] = i;
  }

  console.log("nodes_list After", nodes_list);
  return nodes_list;
}

function nodeGenerate(circuit, connection_list_Function) {
  console.log("nodeGenerate Function Run");
  // variable declaration
  resistor_list = [];
  curr_src_list = [];
  volt_src_list = [];
  vccs_list = [];
  vcvs_list = [];
  cccs_gen_list = [];
  cccs_vs_list = [];
  ccvs_gen_list = [];
  ccvs_vs_list = [];

  connection_list = connection_list_Function;
  element_id_list = [];
  element_type_list = [];
  connection_id_list = [];
  raw_nodes_list = [];

  // circuit = document.getElementById("json").innerHTML;
  // circuit = JSON.parse(circuit);

  console.log("circuit from document", circuit);
  // Pushing each elements to the list as a class

  circuit.forEach((ele) => {
    console.log("Component loop: ", ele);
    console.log("Component Type: ", ele["type"]);
    if (ele["type"] == "resistor") {
      //changed from Resistor
      resistor_list.push(
        new resistor(
          ele["id"],
          ele.id, //["labels"][0]["id"]
          ele.ports[0],
          ele.ports[1],
          ele.value, //["labels"][0]["text"]
          -1,
          -1,
          1
        )
      );
      element_id_list.push(ele["id"]);
      element_type_list.push(ele["type"]);
      if (raw_nodes_list.includes(ele.ports[0] == false)) {
        raw_nodes_list.push(ele.ports[0]);
      }
      if (raw_nodes_list.includes(ele.ports[1] == false)) {
        raw_nodes_list.push(ele.ports[1]);
      }
    } else if (ele["type"] == "CurrentSource") {
      curr_src_list.push(
        new curr_src(
          ele["id"],
          ele.id,
          ele.ports[0],
          ele.ports[1],
          ele.value,
          -1,
          -1,
          2
        )
      );
      element_id_list.push(ele["id"]);
      element_type_list.push(ele["type"]);
      if (raw_nodes_list.includes(ele.ports[0] == false)) {
        raw_nodes_list.push(ele.ports[0]);
      }
      if (raw_nodes_list.includes(ele.ports[1] == false)) {
        raw_nodes_list.push(ele.ports[1]);
      }
    } else if (ele["type"] == "battery") {
      //change from VoltageSource
      console.log("Battery Type: ", ele["type"]);
      volt_src_list.push(
        new volt_src(
          ele["id"],
          ele.id,
          ele.ports[0],
          ele.ports[1],
          ele.value,
          -1,
          -1,
          3
        )
      );
      element_id_list.push(ele["id"]);
      element_type_list.push(ele["type"]);
      if (raw_nodes_list.includes(ele.ports[0] == false)) {
        raw_nodes_list.push(ele.ports[0]);
      }
      if (raw_nodes_list.includes(ele.ports[1] == false)) {
        raw_nodes_list.push(ele.ports[1]);
      }
    } else if (ele["type"] == "VCCS") {
      vccs_list.push(
        new volt_cont_curr_src(
          ele["id"],
          ele.id,
          ele.ports[0],
          ele.ports[1],
          ele.value,
          -1,
          -1,
          ele["labels"][1]["text"],
          ele["labels"][2]["text"],
          -1,
          -1,
          4
        )
      );
      element_id_list.push(ele["id"]);
      element_type_list.push(ele["type"]);
      if (raw_nodes_list.includes(ele.ports[0] == false)) {
        raw_nodes_list.push(ele.ports[0]);
      }
      if (raw_nodes_list.includes(ele.ports[1] == false)) {
        raw_nodes_list.push(ele.ports[1]);
      }
    } else if (ele["type"] == "VCVS") {
      // high_initial declare i think before this function
      // low_initial
      // get high initaial, low initial connections id maybe
      // update node
      // id obtained above should be mapped correspondingly change values
      vcvs_list.push(
        new volt_cont_volt_src(
          ele["id"],
          ele.id,
          ele.ports[0],
          ele.ports[1],
          ele.value,
          -1,
          -1,
          ele["labels"][1]["text"],
          ele["labels"][2]["text"],
          -1,
          -1,
          5
        )
      );
      element_id_list.push(ele["id"]);
      element_type_list.push(ele["type"]);
      if (raw_nodes_list.includes(ele.ports[0] == false)) {
        raw_nodes_list.push(ele.ports[0]);
      }
      if (raw_nodes_list.includes(ele.ports[1] == false)) {
        raw_nodes_list.push(ele.ports[1]);
      }
    } else if (ele["type"] == "CCCS_Gen") {
      cccs_gen_list.push(
        new curr_cont_curr_src_gen(
          ele["id"],
          ele.id,
          ele.ports[0],
          ele.ports[1],
          ele.value,
          -1,
          -1,
          ele["labels"][1]["text"],
          ele["labels"][2]["text"],
          -1,
          -1,
          6
        )
      );
      element_id_list.push(ele["id"]);
      element_type_list.push(ele["type"]);
      if (raw_nodes_list.includes(ele.ports[0] == false)) {
        raw_nodes_list.push(ele.ports[0]);
      }
      if (raw_nodes_list.includes(ele.ports[1] == false)) {
        raw_nodes_list.push(ele.ports[1]);
      }
    } else if (ele["type"] == "CCCS_Vs") {
      cccs_vs_list.push(
        new curr_cont_curr_src_vs(
          ele["id"],
          ele.id,
          ele.ports[0],
          ele.ports[1],
          ele.value,
          -1,
          -1,
          ele["labels"][1]["text"],
          ele["labels"][2]["text"],
          -1,
          -1,
          7
        )
      );
      element_id_list.push(ele["id"]);
      element_type_list.push(ele["type"]);
      if (raw_nodes_list.includes(ele.ports[0] == false)) {
        raw_nodes_list.push(ele.ports[0]);
      }
      if (raw_nodes_list.includes(ele.ports[1] == false)) {
        raw_nodes_list.push(ele.ports[1]);
      }
    } else if (ele["type"] == "CCVS_Gen") {
      ccvs_gen_list.push(
        new curr_cont_volt_src_gen(
          ele["id"],
          ele.id,
          ele.ports[0],
          ele.ports[1],
          ele.value,
          -1,
          -1,
          ele["labels"][1]["text"],
          ele["labels"][2]["text"],
          -1,
          -1,
          8
        )
      );
      element_id_list.push(ele["id"]);
      element_type_list.push(ele["type"]);
      if (raw_nodes_list.includes(ele.ports[0] == false)) {
        raw_nodes_list.push(ele.ports[0]);
      }
      if (raw_nodes_list.includes(ele.ports[1] == false)) {
        raw_nodes_list.push(ele.ports[1]);
      }
    } else if (ele["type"] == "CCVS_Vs") {
      ccvs_vs_list.push(
        new curr_cont_volt_src_vs(
          ele["id"],
          ele.id,
          ele.ports[0],
          ele.ports[1],
          ele.value,
          -1,
          -1,
          ele["labels"][1]["text"],
          ele["labels"][2]["text"],
          -1,
          -1,
          9
        )
      );
      element_id_list.push(ele["id"]);
      element_type_list.push(ele["type"]);
      if (raw_nodes_list.includes(ele.ports[0] == false)) {
        raw_nodes_list.push(ele.ports[0]);
      }
      if (raw_nodes_list.includes(ele.ports[1] == false)) {
        raw_nodes_list.push(ele.ports[1]);
      }
    }
  });
  console.log("resistor_list", resistor_list);
  console.log("volt_src_list", volt_src_list);
  console.log("circuit After Adding component", circuit);
  //We loop through circuit and add the connections
  circuit.forEach((ele) => {
    if (ele["type"] == "draw2d.Connection") {
      connection_list.push(
        new connection(
          ele["id"],
          ele.id,
          ele.value,
          ret_source_target_nodes_from_id(
            ele["source"]["node"],
            ele["source"]["port"]
          ),
          ret_source_target_nodes_from_id(
            ele["target"]["node"],
            ele["target"]["port"]
          )
        )
      );
      connection_id_list.push(ele["id"]);
    }
  });
  console.log("connection_list", connection_list);

  console.log("Component List ", resistor_list, curr_src_list, volt_src_list);

  //Generate list of nodes
  nodes_list = generate_node_list();
  console.log("Generate node list ", nodes_list);

  console.log("Component List ", resistor_list, curr_src_list, volt_src_list);
  var to_change_list = [];
  for (var i = 0; i < connection_list.length; i++) {
    try {
      to_change_list.push([
        parseInt(connection_list[i].label_text),
        connection_list[i].tar_node,
      ]);
    } catch (error) {
      console.log(error);
    }
  }
  //Here we go through and say what node in each component is connected too
  resistor_list.forEach((ele) => {
    ele.node_k = return_node_num_from_port_id(ele.inp_port_id);
    ele.node_l = return_node_num_from_port_id(ele.out_port_id);
  });

  curr_src_list.forEach((ele) => {
    ele.node_k = return_node_num_from_port_id(ele.out_port_id);
    ele.node_l = return_node_num_from_port_id(ele.inp_port_id);
  });

  volt_src_list.forEach((ele) => {
    ele.node_k = return_node_num_from_port_id(ele.out_port_id);
    ele.node_l = return_node_num_from_port_id(ele.inp_port_id);
  });

  vccs_list.forEach((ele) => {
    ele.node_k = return_node_num_from_port_id(ele.inp_port_id);
    ele.node_l = return_node_num_from_port_id(ele.out_port_id);
    ele.node_m = parseInt(ele.cont_high_node);
    ele.node_n = parseInt(ele.cont_low_node);
  });

  vcvs_list.forEach((ele) => {
    ele.node_k = return_node_num_from_port_id(ele.out_port_id);
    ele.node_l = return_node_num_from_port_id(ele.inp_port_id);
    ele.node_m = parseInt(ele.cont_high_node);
    ele.node_n = parseInt(ele.cont_low_node);
  });

  cccs_gen_list.forEach((ele) => {
    ele.node_k = return_node_num_from_port_id(ele.inp_port_id);
    ele.node_l = return_node_num_from_port_id(ele.out_port_id);
    ele.node_m = parseInt(ele.cont_high_node);
    ele.node_n = parseInt(ele.cont_low_node);
  });

  cccs_vs_list.forEach((ele) => {
    ele.node_k = return_node_num_from_port_id(ele.inp_port_id);
    ele.node_l = return_node_num_from_port_id(ele.out_port_id);
    ele.node_m = parseInt(ele.cont_high_node);
    ele.node_n = parseInt(ele.cont_low_node);
  });

  ccvs_gen_list.forEach((ele) => {
    ele.node_k = return_node_num_from_port_id(ele.out_port_id);
    ele.node_l = return_node_num_from_port_id(ele.inp_port_id);
    ele.node_m = parseInt(ele.cont_high_node);
    ele.node_n = parseInt(ele.cont_low_node);
  });

  ccvs_vs_list.forEach((ele) => {
    ele.node_k = return_node_num_from_port_id(ele.out_port_id);
    ele.node_l = return_node_num_from_port_id(ele.inp_port_id);
    ele.node_m = parseInt(ele.cont_high_node);
    ele.node_n = parseInt(ele.cont_low_node);
  });

  // Ensure correct Input validation
  var nodes = nodes_list.length - 1;

  if (
    element_id_list.length == 0 ||
    nodes_list.length == 0 ||
    nodes_list.length == 1
  ) {
    return alert("Please give a valid input and try again");
  } else {
    for (var i = 0; i < resistor_list.length; i++) {
      if (parseFloat(resistor_list[i].label) != resistor_list[i].label) {
        console.log(parseFloat(resistor_list[i].label));
        console.log(resistor_list[i].label);
        return alert(
          "You haven't entered correct information for one of the resistor"
        );
      }
      if (resistor_list[i].node_k > nodes) {
        return alert(
          "The " +
            resistor_list[i].label +
            " ohms resistor's node_high is not valid"
        );
      }
      if (resistor_list[i].node_l > nodes) {
        return alert(
          "The " +
            resistor_list[i].label +
            " ohms resistor's node_low is not valid"
        );
      }
    }

    for (var i = 0; i < curr_src_list.length; i++) {
      if (parseFloat(curr_src_list[i].label) != curr_src_list[i].label) {
        return alert(
          "You haven't entered correct information for one of the current source"
        );
      }
      if (curr_src_list[i].node_k > nodes) {
        return alert(
          "The " +
            curr_src_list[i].label +
            " ampere resistor's node_high is not valid"
        );
      }
      if (curr_src_list[i].node_l > nodes) {
        return alert(
          "The " +
            curr_src_list[i].label +
            " ampere resistor's node_low is not valid"
        );
      }
    }
    for (var i = 0; i < volt_src_list.length; i++) {
      if (parseFloat(volt_src_list[i].label) != volt_src_list[i].label) {
        return alert(
          "You haven't entered correct information for one of the voltage source"
        );
      }
      if (volt_src_list[i].node_k > nodes) {
        return alert(
          "The " +
            volt_src_list[i].label +
            " volts resistor's node_high is not valid"
        );
      }
      if (volt_src_list[i].node_l > nodes) {
        return alert(
          "The " +
            volt_src_list[i].label +
            " volts resistor's node_low is not valid"
        );
      }
    }
    for (var i = 0; i < vccs_list.length; i++) {
      if (parseFloat(vccs_list[i].label) != vccs_list[i].label) {
        return alert(
          "You haven't entered correct information for one of the Voltage controlled current source"
        );
      }
      if (vccs_list[i].node_k > nodes) {
        return alert("The node_high is not valid for one of the VCCS");
      }
      if (vccs_list[i].node_l > nodes) {
        return alert("The node_low is not valid for one of the VCCS");
      }
      if (vccs_list[i].node_m > nodes) {
        return alert(
          "The controlled voltage node_high is not valid for one of the VCCS"
        );
      }
      if (vccs_list[i].node_n > nodes) {
        return alert(
          "The controlled voltage node_low is not valid for one of the VCCS"
        );
      }
    }
    for (var i = 0; i < vcvs_list.length; i++) {
      if (parseFloat(vcvs_list[i].label) != vcvs_list[i].label) {
        return alert(
          "You haven't entered correct information for one of the Voltage controlled voltage source"
        );
      }
      if (vcvs_list[i].node_k > nodes) {
        return alert("The node_high is not valid for one of the VCVS");
      }
      if (vcvs_list[i].node_l > nodes) {
        return alert("The node_low is not valid for one of the VCVS");
      }
      if (vcvs_list[i].node_m > nodes) {
        return alert(
          "The controlled voltage node_high is not valid for one of the VCVS"
        );
      }
      if (vcvs_list[i].node_n > nodes) {
        return alert(
          "The controlled voltage node_low is not valid for one of the VCVS"
        );
      }
    }

    for (var i = 0; i < cccs_gen_list.length; i++) {
      if (parseFloat(cccs_gen_list[i].label) != cccs_gen_list[i].label) {
        return alert(
          "You haven't entered correct information for one of the current controlled current source"
        );
      }
      if (cccs_gen_list[i].node_k > nodes) {
        return alert("The node_high is not valid for one of the CCCS");
      }
      if (cccs_gen_list[i].node_l > nodes) {
        return alert("The node_low is not valid for one of the CCCS");
      }
      if (cccs_gen_list[i].node_m > nodes) {
        return alert(
          "The controlled voltage node_high is not valid for one of the CCCS"
        );
      }
      if (cccs_gen_list[i].node_n > nodes) {
        return alert(
          "The controlled voltage node_low is not valid for one of the CCCS"
        );
      }
    }
    for (var i = 0; i < cccs_vs_list.length; i++) {
      if (parseFloat(cccs_vs_list[i].label) != cccs_vs_list[i].label) {
        return alert(
          "You haven't entered correct information for one of the current controlled current source"
        );
      }
      if (cccs_vs_list[i].node_k > nodes) {
        return alert("The node_high is not valid for one of the CCCS");
      }
      if (cccs_vs_list[i].node_l > nodes) {
        return alert("The node_low is not valid for one of the CCCS");
      }
      if (cccs_vs_list[i].node_m > nodes) {
        return alert(
          "The controlled voltage node_high is not valid for one of the CCCS"
        );
      }
      if (cccs_vs_list[i].node_n > nodes) {
        return alert(
          "The controlled voltage node_low is not valid for one of the CCCS"
        );
      }
    }
    for (var i = 0; i < ccvs_gen_list.length; i++) {
      if (parseFloat(ccvs_gen_list[i].label) != ccvs_gen_list[i].label) {
        return alert(
          "You haven't entered correct information for one of the current controlled voltage source"
        );
      }
      if (ccvs_gen_list[i].node_k > nodes) {
        return alert("The node_high is not valid for one of the CCVS");
      }
      if (ccvs_gen_list[i].node_l > nodes) {
        return alert("The node_low is not valid for one of the CCVS");
      }
      if (ccvs_gen_list[i].node_m > nodes) {
        return alert(
          "The controlled voltage node_high is not valid for one of the CCVS"
        );
      }
      if (ccvs_gen_list[i].node_n > nodes) {
        return alert(
          "The controlled voltage node_low is not valid for one of the CCVS"
        );
      }
    }
    for (var i = 0; i < ccvs_vs_list.length; i++) {
      if (parseFloat(ccvs_vs_list[i].label) != ccvs_vs_list[i].label) {
        return alert(
          "You haven't entered correct information for one of the current controlled voltage source"
        );
      }
      if (ccvs_vs_list[i].node_k > nodes) {
        return alert("The node_high is not valid for one of the CCVS");
      }
      if (ccvs_vs_list[i].node_l > nodes) {
        return alert("The node_low is not valid for one of the CCVS");
      }
      if (ccvs_vs_list[i].node_m > nodes) {
        return alert(
          "The controlled voltage node_high is not valid for one of the CCVS"
        );
      }
      if (ccvs_vs_list[i].node_n > nodes) {
        return alert(
          "The controlled voltage node_low is not valid for one of the CCVS"
        );
      }
    }
  }

  //End of input validation
  //Contiune to tell what ports are connected to what node

  for (var i = 0; i < to_change_list.length; i++) {
    for (var j = 0; j < vccs_list.length; j++) {
      if (
        parseInt(vccs_list[j].node_m) == to_change_list[i][0] &&
        vccs_list[j].m_changed == 0
      ) {
        vccs_list[j].node_m = return_node_num_from_port_id(
          to_change_list[i][1]
        );
        vccs_list[j].m_changed = 1;
      }
      if (
        parseInt(vccs_list[j].node_n) == to_change_list[i][0] &&
        vccs_list[j].n_changed == 0
      ) {
        vccs_list[j].node_n = return_node_num_from_port_id(
          to_change_list[i][1]
        );
        vccs_list[j].n_changed = 1;
      }
    }
    for (var j = 0; j < vcvs_list.length; j++) {
      if (
        parseInt(vcvs_list[j].node_m) == to_change_list[i][0] &&
        vcvs_list[j].m_changed == 0
      ) {
        vcvs_list[j].node_m = return_node_num_from_port_id(
          to_change_list[i][1]
        );
        vcvs_list[j].m_changed = 1;
      }
      if (
        parseInt(vcvs_list[j].node_n) == to_change_list[i][0] &&
        vcvs_list[j].n_changed == 0
      ) {
        vcvs_list[j].node_n = return_node_num_from_port_id(
          to_change_list[i][1]
        );
        vcvs_list[j].n_changed = 1;
      }
    }
    for (var j = 0; j < cccs_gen_list.length; j++) {
      if (
        parseInt(cccs_gen_list[j].node_m) == to_change_list[i][0] &&
        cccs_gen_list[j].m_changed == 0
      ) {
        cccs_gen_list[j].node_m = return_node_num_from_port_id(
          to_change_list[i][1]
        );
        cccs_gen_list[j].m_changed = 1;
      }
      if (
        parseInt(cccs_gen_list[j].node_n) == to_change_list[i][0] &&
        cccs_gen_list[j].n_changed == 0
      ) {
        cccs_gen_list[j].node_n = return_node_num_from_port_id(
          to_change_list[i][1]
        );
        cccs_gen_list[j].n_changed = 1;
      }
    }
    for (var j = 0; j < cccs_vs_list.length; j++) {
      if (
        parseInt(cccs_vs_list[j].node_m) == to_change_list[i][0] &&
        cccs_vs_list[j].m_changed == 0
      ) {
        cccs_vs_list[j].node_m = return_node_num_from_port_id(
          to_change_list[i][1]
        );
        cccs_vs_list[j].m_changed = 1;
      }
      if (
        parseInt(cccs_vs_list[j].node_n) == to_change_list[i][0] &&
        cccs_vs_list[j].n_changed == 0
      ) {
        cccs_vs_list[j].node_n = return_node_num_from_port_id(
          to_change_list[i][1]
        );
        cccs_vs_list[j].n_changed = 1;
      }
    }
    for (var j = 0; j < ccvs_gen_list.length; j++) {
      if (
        parseInt(ccvs_gen_list[j].node_m) == to_change_list[i][0] &&
        ccvs_gen_list[j].m_changed == 0
      ) {
        ccvs_gen_list[j].node_m = return_node_num_from_port_id(
          to_change_list[i][1]
        );
        ccvs_gen_list[j].m_changed = 1;
      }
      if (
        parseInt(ccvs_gen_list[j].node_n) == to_change_list[i][0] &&
        ccvs_gen_list[j].n_changed == 0
      ) {
        ccvs_gen_list[j].node_n = return_node_num_from_port_id(
          to_change_list[i][1]
        );
        ccvs_gen_list[j].n_changed = 1;
      }
    }
    for (var j = 0; j < ccvs_vs_list.length; j++) {
      if (
        parseInt(ccvs_vs_list[j].node_m) == to_change_list[i][0] &&
        ccvs_vs_list[j].m_changed == 0
      ) {
        ccvs_vs_list[j].node_m = return_node_num_from_port_id(
          to_change_list[i][1]
        );
        ccvs_vs_list[j].m_changed = 1;
      }
      if (
        parseInt(ccvs_vs_list[j].node_n) == to_change_list[i][0] &&
        ccvs_vs_list[j].n_changed == 0
      ) {
        ccvs_vs_list[j].node_n = return_node_num_from_port_id(
          to_change_list[i][1]
        );
        ccvs_vs_list[j].n_changed = 1;
      }
    }
  }

}

export const simulate = (circuitData, mappedConnections, lines) => {
  console.log("new simulate -------------------------------", circuitData);
  // functionining the classes for the connection, resistor, current source, voltage source, controlled voltage and controlled current source
  var circuit = circuitData;
  var connection_list = mappedConnections;
  //  It is the one that contains the final mapping of the number of nodes
  nodeGenerate(circuit, connection_list);
  // Creates circuit data
  // Creates list of connections
  // Generates nodes
  // Tells each component what nodes its port is connected too

  var nodes = nodes_list.length - 1; //Returns number of nodes

  // Create variables for the matrix and process for each element.
  var size = parseInt(nodes + volt_src_list.length + vcvs_list.length);
  console.log("volt_src_list.length: ", volt_src_list.length);
  var cond_matrix = Array(size)
    .fill()
    .map(() => Array(size).fill(0));

  var curr_matrix = Array(size)
    .fill()
    .map(() => Array(1).fill(0));

  var var_matrix = Array(size)
    .fill()
    .map(() => Array(1).fill(0));

  var var_list = [];
  for (var i = 0; i < nodes; i++) {
    var_list.push("V_" + String(i + 1));
  }

  var obj_volt_src_cnt = 0;
  var obj_vccs_cnt = 0; // Variable for selecting the apt column if the element is a vccs
  var obj_vcvs_cnt = 0;
  var obj_cccs_gen_cnt = 0;
  var obj_cccs_vs_cnt = 0;
  var obj_ccvs_gen_cnt = 0;
  var obj_ccvs_vs_cnt = 0;

  // Update the current source list
  for (var obj = 0; obj < curr_src_list.length; obj++) {
    // Contributes only to current matrix
    var n_k = parseInt(curr_src_list[obj].node_k) - 1;
    var n_l = parseInt(curr_src_list[obj].node_l) - 1;
    var current = parseFloat(curr_src_list[obj].label);

    if (n_k != -1 && n_l != -1) {
      curr_matrix[n_k][0] += current;
      curr_matrix[n_l][0] -= current;
    } else if (n_k == -1 && n_l != -1) {
      curr_matrix[n_l][0] -= current;
    } else if (n_k != -1 && n_l == -1) {
      curr_matrix[n_k][0] += current;
    }
  }
  // Update the voltage source list
  for (var obj = 0; obj < volt_src_list.length; obj++) {
    //  The following code is only when there is one voltage source in the circuit
    // Contributes to both current and conductance matrix
    var n_k = parseInt(volt_src_list[obj].node_k) - 1;
    var n_l = parseInt(volt_src_list[obj].node_l) - 1;

    var voltage = parseFloat(volt_src_list[obj].label);
    var count = 0;
    var new_var = "I_" + String(n_k + 1) + "_" + String(n_l + 1);
    for (var i = 0; i < var_list.length; i++) {
      if (var_list[i] == new_var) {
        count = count + 1;
      }
    }
    if (count == 0) {
      var_list.push(new_var);
    }
    var idx = var_list.indexOf(new_var);
    if (n_k != -1 && n_l != -1) {
      cond_matrix[n_k][idx] += 1;
      cond_matrix[n_l][idx] -= 1;
      cond_matrix[idx][n_k] += 1;
      cond_matrix[idx][n_l] -= 1;

      curr_matrix[idx][0] += voltage;
      obj_volt_src_cnt += 1;
    } else if (n_k == -1 && n_l != -1) {
      cond_matrix[n_l][idx] -= 1;
      cond_matrix[idx][n_l] -= 1;

      curr_matrix[idx][0] += voltage;

      obj_volt_src_cnt += 1;
    } else if (n_l == -1 && n_k != -1) {
      cond_matrix[n_k][idx] += 1;
      cond_matrix[idx][n_k] += 1;

      curr_matrix[idx][0] += voltage;

      obj_volt_src_cnt += 1;
    }
  }

  for (var obj = 0; obj < vccs_list.length; obj++) {
    var n_k = parseInt(vccs_list[obj].node_k) - 1;
    var n_l = parseInt(vccs_list[obj].node_l) - 1;

    var ctrl_n_m = parseInt(vccs_list[obj].node_m) - 1;
    var ctrl_n_n = parseInt(vccs_list[obj].node_n) - 1;

    var transconductance = parseFloat(vccs_list[obj].label);
    if (n_k != -1 && n_l != -1 && ctrl_n_m != -1 && ctrl_n_n != -1) {
      cond_matrix[n_k][ctrl_n_m] += transconductance;
      cond_matrix[n_k][ctrl_n_n] -= transconductance;
      cond_matrix[n_l][ctrl_n_m] -= transconductance;
      cond_matrix[n_l][ctrl_n_n] += transconductance;
    } else if (n_k == -1 && n_l != -1 && ctrl_n_m != -1 && ctrl_n_n != -1) {
      cond_matrix[n_l][ctrl_n_m] -= transconductance;
      cond_matrix[n_l][ctrl_n_n] += transconductance;
    } else if (n_k != -1 && n_l == -1 && ctrl_n_m != -1 && ctrl_n_n != -1) {
      cond_matrix[n_k][ctrl_n_m] += transconductance;
      cond_matrix[n_k][ctrl_n_n] -= transconductance;
    } else if (n_k != -1 && n_l != -1 && ctrl_n_m == -1 && ctrl_n_n != -1) {
      cond_matrix[n_k][ctrl_n_n] -= transconductance;
      cond_matrix[n_l][ctrl_n_n] += transconductance;
    } else if (n_k != -1 && n_l != -1 && ctrl_n_m != -1 && ctrl_n_n == -1) {
      cond_matrix[n_k][ctrl_n_m] += transconductance;
      cond_matrix[n_l][ctrl_n_m] -= transconductance;
    } else if (n_k == -1 && n_l != -1 && ctrl_n_m == -1 && ctrl_n_n != -1) {
      cond_matrix[n_l][ctrl_n_n] += transconductance;
    } else if (n_k == -1 && n_l != -1 && ctrl_n_m != -1 && ctrl_n_n == -1) {
      cond_matrix[n_l][ctrl_n_m] -= transconductance;
    } else if (n_k != -1 && n_l == -1 && ctrl_n_m == -1 && ctrl_n_n != -1) {
      cond_matrix[n_k][ctrl_n_n] -= transconductance;
    } else if (n_k != -1 && n_l == -1 && ctrl_n_m != -1 && ctrl_n_n == -1) {
      cond_matrix[n_k][ctrl_n_m] += transconductance;
    }
  }
  for (var obj = 0; obj < vcvs_list.length; obj++) {
    var n_k = parseInt(vcvs_list[obj].node_k) - 1;
    var n_l = parseInt(vcvs_list[obj].node_l) - 1;

    var ctrl_n_m = parseInt(vcvs_list[obj].node_m) - 1;
    var ctrl_n_n = parseInt(vcvs_list[obj].node_n) - 1;

    var ctrl_ftr = parseFloat(vcvs_list[obj].label);
    var new_var = "I_" + String(n_k + 1) + "_" + String(n_l + 1);
    var count = 0;
    for (var i = 0; i < var_list.length; i++) {
      if (var_list[i] == new_var) {
        count = count + 1;
      }
    }
    if (count == 0) {
      var_list.push(new_var);
    }

    var idx = var_list.indexOf(new_var);

    if (n_k != -1 && n_l != -1 && ctrl_n_m != -1 && ctrl_n_n != -1) {
      cond_matrix[idx][n_k] += 1;
      cond_matrix[idx][n_l] -= 1;
      cond_matrix[idx][ctrl_n_m] -= ctrl_ftr;
      cond_matrix[idx][ctrl_n_n] += ctrl_ftr;
      cond_matrix[n_k][idx] += 1;
      cond_matrix[n_l][idx] -= 1;

      obj_vcvs_cnt += 1;
    } else if (n_k == -1 && n_l != -1 && ctrl_n_m != -1 && ctrl_n_n != -1) {
      cond_matrix[idx][n_l] -= 1;
      cond_matrix[idx][ctrl_n_m] -= ctrl_ftr;
      cond_matrix[idx][ctrl_n_n] += ctrl_ftr;
      cond_matrix[n_l][idx] -= 1;

      obj_vcvs_cnt += 1;
    } else if (n_k != -1 && n_l == -1 && ctrl_n_m != -1 && ctrl_n_n != -1) {
      cond_matrix[idx][n_k] += 1;
      cond_matrix[idx][ctrl_n_m] -= ctrl_ftr;
      cond_matrix[idx][ctrl_n_n] += ctrl_ftr;
      cond_matrix[n_k][idx] += 1;

      obj_vcvs_cnt += 1;
    } else if (n_k != -1 && n_l != -1 && ctrl_n_m == -1 && ctrl_n_n != -1) {
      cond_matrix[idx][n_k] += 1;
      cond_matrix[idx][n_l] -= 1;
      cond_matrix[idx][ctrl_n_n] += ctrl_ftr;
      cond_matrix[n_k][idx] += 1;
      cond_matrix[n_l][idx] -= 1;

      obj_vcvs_cnt += 1;
    } else if (n_k != -1 && n_l != -1 && ctrl_n_m != -1 && ctrl_n_n == -1) {
      cond_matrix[idx][n_k] += 1;
      cond_matrix[idx][n_l] -= 1;
      cond_matrix[idx][ctrl_n_m] -= ctrl_ftr;
      cond_matrix[n_k][idx] += 1;
      cond_matrix[n_l][idx] -= 1;

      obj_vcvs_cnt += 1;
    } else if (n_k == -1 && n_l != -1 && ctrl_n_m == -1 && ctrl_n_n != -1) {
      cond_matrix[idx][n_l] -= 1;
      cond_matrix[idx][ctrl_n_n] += ctrl_ftr;
      cond_matrix[n_l][idx] -= 1;

      obj_vcvs_cnt += 1;
    } else if (n_k == -1 && n_l != -1 && ctrl_n_m != -1 && ctrl_n_n == -1) {
      cond_matrix[idx][n_l] -= 1;
      cond_matrix[idx][ctrl_n_m] -= ctrl_ftr;
      cond_matrix[n_l][idx] -= 1;

      obj_vcvs_cnt += 1;
    } else if (n_k != -1 && n_l == -1 && ctrl_n_m == -1 && ctrl_n_n != -1) {
      cond_matrix[idx][n_k] += 1;
      cond_matrix[idx][ctrl_n_n] += ctrl_ftr;
      cond_matrix[n_k][idx] += 1;

      obj_vcvs_cnt += 1;
    } else if (n_k != -1 && n_l == -1 && ctrl_n_m != -1 && ctrl_n_n == -1) {
      cond_matrix[idx][n_k] += 1;
      cond_matrix[idx][ctrl_n_m] -= ctrl_ftr;
      cond_matrix[n_k][idx] += 1;

      obj_vcvs_cnt += 1;
    }
  }

  let var_list2;
  let curr_matrix1;

  for (var obj = 0; obj < cccs_gen_list.length; obj++) {
    var n_k = parseInt(cccs_gen_list[obj].node_k) - 1;
    var n_l = parseInt(cccs_gen_list[obj].node_l) - 1;
    var ctrl_n_m = parseInt(cccs_gen_list[obj].node_m) - 1;
    var ctrl_n_n = parseInt(cccs_gen_list[obj].node_n) - 1;
    var ctrl_ftr = parseFloat(cccs_gen_list[obj].label);

    var new_var_V = "V_" + String(ctrl_n_m + 1) + "_";

    var var_list1 = var_list.slice(0, ctrl_n_m + 1);
    var_list1.push(new_var_V);
    var_list2 = var_list1.concat(var_list.slice(ctrl_n_m + 1));
    var_list = var_list2;

    var cond_matrix1 = cond_matrix.slice(0, ctrl_n_m + 1);
    cond_matrix1.push(Array(size).fill(0));
    cond_matrix1 = cond_matrix1.concat(cond_matrix.slice(ctrl_n_m + 1));
    cond_matrix = cond_matrix1;

    var cond_matrix2 = cond_matrix
      .slice(0)
      .map((i) => i.slice(0, ctrl_n_m + 1));
    var cond_matrix_two = cond_matrix2;

    var cond_matrix3 = cond_matrix.slice(0).map((i) => i.slice(ctrl_n_m + 1));
    for (var j = 0; j < cond_matrix2.length; j++) {
      cond_matrix2[j][cond_matrix2[j].length] = 0;
    }

    var cond_matrix4 = [];
    for (var i = 0; i < cond_matrix2.length; i++) {
      cond_matrix4[i] = cond_matrix2[i].concat(cond_matrix3[i]);
    }
    cond_matrix = cond_matrix4;
    curr_matrix1 = curr_matrix.slice(0, ctrl_n_m + 1);
    curr_matrix1.push(Array(1).fill(0));
    curr_matrix1 = curr_matrix1.concat(curr_matrix.slice(ctrl_n_m + 1));
    curr_matrix = curr_matrix1;

    var new_var_I = "I_" + String(ctrl_n_m + 1) + "_" + String(ctrl_n_n + 1);
    var_list.push(new_var_I);
    cond_matrix.push(Array(cond_matrix[0].length).fill(0));
    var cond_matrix_check = cond_matrix;
    var length = cond_matrix.length;
    for (var k = 0; k < length; k++) {
      cond_matrix[k] = cond_matrix[k].concat(0);
    }
    curr_matrix.push(Array(1).fill(0));

    var i_mn = var_list.indexOf(
      "I_" + String(ctrl_n_m + 1) + "_" + String(ctrl_n_n + 1)
    );
    if (n_k != -1) {
      n_k = var_list.indexOf("V_" + String(n_k + 1));
    }
    if (n_l != -1) {
      n_l = var_list.indexOf("V_" + String(n_l + 1));
    }
    if (ctrl_n_m != -1) {
      ctrl_n_m = var_list.indexOf("V_" + String(ctrl_n_m + 1));
      ctrl_n_n = var_list.indexOf("V_" + String(ctrl_n_m + 1));
    }

    if (n_k != -1 && n_l != -1 && ctrl_n_m != -1) {
      cond_matrix[n_k][i_mn] += ctrl_ftr;
      cond_matrix[n_l][i_mn] -= ctrl_ftr;
      cond_matrix[ctrl_n_m][i_mn] += 1;
      cond_matrix[ctrl_n_m + 1][i_mn] -= 1;
      cond_matrix[i_mn][ctrl_n_m] += 1;
      cond_matrix[i_mn][ctrl_n_m + 1] -= 1;
    } else if (n_k == -1 && n_l != -1 && ctrl_n_m != -1) {
      cond_matrix[n_l][i_mn] -= ctrl_ftr;
      cond_matrix[ctrl_n_m][i_mn] += 1;
      cond_matrix[ctrl_n_m + 1][i_mn] -= 1;
      cond_matrix[i_mn][ctrl_n_m] += 1;
      cond_matrix[i_mn][ctrl_n_m + 1] -= 1;
    } else if (n_k != -1 && n_l == -1 && ctrl_n_m != -1) {
      cond_matrix[n_k][i_mn] += ctrl_ftr;
      cond_matrix[ctrl_n_m][i_mn] += 1;
      cond_matrix[ctrl_n_m + 1][i_mn] -= 1;
      cond_matrix[i_mn][ctrl_n_m] += 1;
      cond_matrix[i_mn][ctrl_n_m + 1] -= 1;
    } else if (n_k != -1 && n_l != -1 && ctrl_n_m == -1) {
      cond_matrix[n_k][i_mn] += ctrl_ftr;
      cond_matrix[n_l][i_mn] -= ctrl_ftr;
      cond_matrix[ctrl_n_m + 1][i_mn] -= 1;
      cond_matrix[i_mn][ctrl_n_m + 1] -= 1;
    } else if (n_k == -1 && n_l != -1 && ctrl_n_m == -1) {
      cond_matrix[n_l][i_mn] -= ctrl_ftr;
      cond_matrix[ctrl_n_m + 1][i_mn] -= 1;
      cond_matrix[i_mn][ctrl_n_m + 1] -= 1;
    } else if (n_k != -1 && n_l == -1 && ctrl_n_m == -1) {
      cond_matrix[n_k][i_mn] += ctrl_ftr;
      cond_matrix[ctrl_n_m + 1][i_mn] -= 1;
      cond_matrix[i_mn][ctrl_n_m + 1] -= 1;
    }
  }

  for (var obj = 0; obj < ccvs_gen_list.length; obj++) {
    var n_k = parseInt(ccvs_gen_list[obj].node_k) - 1;
    var n_l = parseInt(ccvs_gen_list[obj].node_l) - 1;
    var ctrl_n_m = parseInt(ccvs_gen_list[obj].node_m) - 1;
    var ctrl_n_n = parseInt(ccvs_gen_list[obj].node_n) - 1;
    var transresistance = parseFloat(ccvs_gen_list[obj].label);

    var new_var_V = "V_" + String(ctrl_n_m + 1) + "_";
    var var_list1 = var_list.slice(0, ctrl_n_m + 1);
    var_list1.push(new_var_V);
    var_list2 = var_list1.concat(var_list.slice(ctrl_n_m + 1));
    var_list = var_list2;

    var cond_matrix1 = cond_matrix.slice(0, ctrl_n_m + 1);

    cond_matrix1.push(Array(size).fill(0));
    cond_matrix1 = cond_matrix1.concat(cond_matrix.slice(ctrl_n_m + 1));
    cond_matrix = cond_matrix1;
    var cond_matrix2 = cond_matrix
      .slice(0)
      .map((i) => i.slice(0, ctrl_n_m + 1));
    var cond_matrix3 = cond_matrix.slice(0).map((i) => i.slice(ctrl_n_m + 1));
    for (var j = 0; j < cond_matrix2.length; j++) {
      cond_matrix2[j][cond_matrix2[j].length] = 0;
    }

    var cond_matrix4 = [];
    for (var i = 0; i < cond_matrix2.length; i++) {
      cond_matrix4[i] = cond_matrix2[i].concat(cond_matrix3[i]);
    }
    cond_matrix = cond_matrix4;

    curr_matrix1 = curr_matrix.slice(0, ctrl_n_m + 1);
    curr_matrix1.push(Array(1).fill(0));
    curr_matrix1 = curr_matrix1.concat(curr_matrix.slice(ctrl_n_m + 1));
    curr_matrix = curr_matrix1;

    var new_var_I = "I_" + String(ctrl_n_m + 1) + "_" + String(ctrl_n_n + 1);
    var_list.push(new_var_I);
    cond_matrix.push(Array(cond_matrix[0].length).fill(0));
    var length = cond_matrix[0].length;
    for (var j = 0; j < cond_matrix.length; j++) {
      cond_matrix[j][length] = 0;
    }
    curr_matrix.push(Array(1).fill(0));

    var new_var_I = "I_" + String(n_k + 1) + "_" + String(n_l + 1);
    var_list.push(new_var_I);
    cond_matrix.push(Array(cond_matrix[0].length).fill(0));
    length = cond_matrix[0].length;
    for (var j = 0; j < cond_matrix.length; j++) {
      cond_matrix[j][length] = 0;
    }
    curr_matrix.push(Array(1).fill(0));

    var i_mn = var_list.indexOf(
      "I_" + String(ctrl_n_m + 1) + "_" + String(ctrl_n_n + 1)
    );
    var i_kl = var_list.indexOf("I_" + String(n_k + 1) + "_" + String(n_l + 1));
    if (n_k != -1) {
      n_k = var_list.indexOf("V_" + String(n_k + 1));
    }
    if (n_l != -1) {
      n_l = var_list.indexOf("V_" + String(n_l + 1));
    }
    if (ctrl_n_m != -1) {
      ctrl_n_m = var_list.indexOf("V_" + String(ctrl_n_m + 1));
    }
    if (ctrl_n_n != -1) {
      ctrl_n_n = var_list.indexOf("V_" + String(ctrl_n_n + 1));
    }
    if (n_k != -1 && n_l != -1 && ctrl_n_m != -1) {
      cond_matrix[n_k][i_kl] += 1;
      cond_matrix[n_l][i_kl] -= 1;
      cond_matrix[ctrl_n_m][i_mn] += 1;
      cond_matrix[ctrl_n_m + 1][i_mn] -= 1;
      cond_matrix[i_mn][ctrl_n_m] += 1;
      cond_matrix[i_mn][ctrl_n_m + 1] -= 1;
      cond_matrix[i_kl][n_k] += 1;
      cond_matrix[i_kl][n_l] -= 1;
      cond_matrix[i_kl][i_mn] -= transresistance;
    } else if (n_k == -1 && n_l != -1 && ctrl_n_m != -1) {
      cond_matrix[n_l][i_kl] -= 1;
      cond_matrix[ctrl_n_m][i_mn] += 1;
      cond_matrix[ctrl_n_m + 1][i_mn] -= 1;
      cond_matrix[i_mn][ctrl_n_m] += 1;
      cond_matrix[i_mn][ctrl_n_m + 1] -= 1;
      cond_matrix[i_kl][n_l] += 1;
      cond_matrix[i_kl][i_mn] -= transresistance;
    } else if (n_k != -1 && n_l == -1 && ctrl_n_m != -1) {
      cond_matrix[n_k][i_kl] += 1;
      cond_matrix[ctrl_n_m][i_mn] += 1;
      cond_matrix[ctrl_n_m + 1][i_mn] -= 1;
      cond_matrix[i_mn][ctrl_n_m] += 1;
      cond_matrix[i_mn][ctrl_n_m + 1] -= 1;
      cond_matrix[i_kl][n_k] += 1;
      cond_matrix[i_kl][i_mn] -= transresistance;
    } else if (n_k != -1 && n_l != -1 && ctrl_n_m == -1) {
      cond_matrix[n_k][i_kl] += 1;
      cond_matrix[n_l][i_kl] -= 1;
      cond_matrix[ctrl_n_m + 1][i_mn] -= 1;
      cond_matrix[i_mn][ctrl_n_m + 1] -= 1;
      cond_matrix[i_kl][n_k] += 1;
      cond_matrix[i_kl][n_l] += 1;
      cond_matrix[i_kl][i_mn] -= transresistance;
    } else if (n_k == -1 && n_l != -1 && ctrl_n_m == -1) {
      cond_matrix[n_l][i_kl] -= 1;
      cond_matrix[ctrl_n_m + 1][i_mn] -= 1;
      cond_matrix[i_mn][ctrl_n_m + 1] -= 1;
      cond_matrix[i_kl][n_l] += 1;
      cond_matrix[i_kl][i_mn] -= transresistance;
    } else if (n_k != -1 && n_l == -1 && ctrl_n_m == -1) {
      cond_matrix[n_k][i_kl] += 1;
      cond_matrix[ctrl_n_m + 1][i_mn] -= 1;
      cond_matrix[i_mn][ctrl_n_m + 1] -= 1;
      cond_matrix[i_kl][n_k] += 1;
      cond_matrix[i_kl][i_mn] -= transresistance;
    }
  }
  // Goe through each resistor and updates the matrix
  for (var obj = 0; obj < resistor_list.length; obj++) {
    var n_k = parseInt(resistor_list[obj].node_k);

    var n_l = parseInt(resistor_list[obj].node_l);

    if (ccvs_gen_list.length > 0) {
      var ccvs_high = parseInt(ccvs_gen_list[0].node_m);
      var ccvs_low = parseInt(ccvs_gen_list[0].node_n);

      if (n_l == ccvs_high && n_k == ccvs_low) {
        var temp = n_l;
        n_l = n_k;
        n_k = temp;
        if (n_l <= ccvs_high) {
          n_l = n_l - 1;
        }
      } else if (n_k == ccvs_high && n_l == ccvs_low) {
        n_k = n_k;
        if (n_l <= ccvs_high) {
          n_l = n_l - 1;
        }
      } else if (n_l <= ccvs_high && n_k <= ccvs_high) {
        n_l = n_l - 1;
        n_k = n_k - 1;
      } else if (n_k <= ccvs_high && n_l > ccvs_high) {
        n_k = n_k - 1;
      } else if (n_l <= ccvs_high && n_k > ccvs_high) {
        n_l = n_l - 1;
      }
    } else if (cccs_gen_list.length > 0) {
      var cccs_high = parseInt(cccs_gen_list[0].node_m);
      var cccs_low = parseInt(cccs_gen_list[0].node_n);

      if (n_l == cccs_high && n_k == cccs_low) {
        var temp = n_l;
        n_l = n_k;
        n_k = temp;
        if (n_l <= cccs_high) {
          n_l = n_l - 1;
        }
      } else if (n_k == cccs_high && n_l == cccs_low) {
        n_k = n_k;
        if (n_l <= cccs_high) {
          n_l = n_l - 1;
        }
      } else if (n_l <= cccs_high && n_k <= cccs_high) {
        n_l = n_l - 1;
        n_k = n_k - 1;
      } else if (n_k <= cccs_high && n_l > cccs_high) {
        n_k = n_k - 1;
      } else if (n_l <= cccs_high && n_k > cccs_high) {
        n_l = n_l - 1;
      }
    } else {
      n_k = n_k - 1;
      n_l = n_l - 1;
    }

    var conductance = 1.0 / parseFloat(resistor_list[obj].label);

    if (n_k != -1 && n_l != -1) {
      cond_matrix[n_k][n_k] += conductance;
      cond_matrix[n_k][n_l] -= conductance;
      cond_matrix[n_l][n_k] -= conductance;
      cond_matrix[n_l][n_l] += conductance;
    } else if (n_k == -1 && n_l != -1) {
      cond_matrix[n_l][n_l] += conductance;
    } else if (n_l == -1 && n_k != -1) {
      cond_matrix[n_k][n_k] += conductance;
    }
  }
  let cond_matrix_inv;
  console.log("cond_matrix", cond_matrix);

  let outputDict = {};

try {
  cond_matrix_inv = math.inv(cond_matrix);
} catch (error) {
    console.error("Error in cond_matrix: ", error);

    // Set outputDict to zero for all nodes
    for (let i = 0; i < var_list.length; i++) {
        outputDict[var_list[i]] = null;

        // For logging
        let tempVar = var_list[i] + " = 0";
        console.log(tempVar);
    }
    return [outputDict, nodes_list];
}




  var output_matrix = math.multiply(cond_matrix_inv, curr_matrix);

  //   // Display in popup
  //   var output = document.getElementById("output");
  //   output.innerHTML = "";
  //   var h2 = document.createElement("h2");
  //   h2.setAttribute("style", "padding-bottom: 30px");
  //   h2.innerHTML = "Output: ";
  //   output.appendChild(h2);
  //   for (var i = 0; i < var_list.length; i++) {
  //     if (var_list[i][0] == "V") {
  //       var h3 = document.createElement("h3");
  //       h3.innerHTML =
  //         var_list[i] + " = " + output_matrix[i][0].toFixed(2) + " V ";
  //       output.appendChild(h3);
  //     }

  //     if (var_list[i][0] == "I") {
  //       var h3 = document.createElement("h3");
  //       h3.innerHTML =
  //         var_list[i] + " = " + output_matrix[i][0].toFixed(2) + " A ";
  //       output.appendChild(h3);
  //     }
  //   }

  console.log("Results");
  const output = [];
  for (var i = 0; i < var_list.length; i++) {
    if (var_list[i][0] == "V") {
      var TempVar =
        var_list[i] + " = " + output_matrix[i][0].toFixed(2) + " V ";
      console.log(TempVar);
      output.push(TempVar);
    }

    if (var_list[i][0] == "I") {
      var TempVar2 =
        var_list[i] + " = " + output_matrix[i][0].toFixed(2) + " A ";
      console.log(TempVar2);
      output.push(TempVar2);
    }
  }

  

  for (var i = 0; i < var_list.length; i++) {
    // Determine if the variable is voltage (V) or current (I) and format accordingly
    let value = Math.abs(output_matrix[i][0].toFixed(2)); //making it so always positive number
    let unit = var_list[i][0] == "V" ? " V" : " A";

    // Create a key-value pair in the dictionary
    outputDict[var_list[i]] = value;

    // For logging purposes, create a string representation and print it
    let TempVar = var_list[i] + " = " + value + unit;
    console.log(TempVar);
  }

  console.log("outputDict", outputDict); // Print the entire dictionary

  console.log("lines", lines); // Print the entire dictionary

  const updateLineLabels = (lines, outputDict, nodes_list) => {
    lines.forEach((line) => {
      // Check if the line connects to b1_input, if so, set the voltage to 0V.
      if (
        (line.to.componentId === "b1" && line.to.portId === "input") ||
        (line.from.componentId === "b1" && line.from.portId === "input")
      ) {
        line.label.text = "0V";
      } else {
        //Pick a port
        // Retrieve the node numbers using a helper function that matches the port IDs to the node list.
        const fromNodeNum = return_node_num_from_port_id(
          `${line.from.componentId}_${line.from.portId}`,
          nodes_list
        );
        // const toNodeNum = return_node_num_from_port_id(`${line.to.componentId}_${line.to.portId}`, nodes_list);

        //Lets retreive voltage
        const fromVoltage = outputDict[`V_${fromNodeNum}`];

        console.log("fromNodeNum,fromVoltage", fromNodeNum, fromVoltage);

        // Retrieve the voltage values using a helper function that matches the node numbers to the var list.
        // const fromVoltage = getVoltageFromVarList(fromNodeNum, var_list);
        // const toVoltage = getVoltageFromVarList(toNodeNum, var_list);

        // Update the label text with the voltage values.
        line.label.text = `N ${fromNodeNum}: ${fromVoltage}V`;
      }
    });
  };

  console.log(lines);
  console.log("nodes_list", nodes_list);

  console.log("output_matrix", output_matrix);
  console.log("var_list", var_list);

  console.log("Before Lines List ", lines);
  updateLineLabels(lines, outputDict, nodes_list);
  console.log("Update node labels", lines);

  console.log("End Of Simulation");
  return [outputDict, nodes_list];
};
