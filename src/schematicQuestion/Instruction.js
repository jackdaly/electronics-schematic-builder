import React from 'react';

const Instruction = ({ text }) => {
  return <div className="instruction"><h3 style={{fontSize:'20px',fontWeight:'500',textAlign: 'left'}}>{text}</h3></div>;
};

export default Instruction;
