/**
 * Epic Mode Text Parser
 * Converts text-based code to AST (Abstract Syntax Tree)
 * AST structure matches block-based editor output
 */

export function parseEpicCode(code) {
  const lines = code
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('//'));

  const ast = {
    type: 'program',
    version: '1.0',
    scripts: []
  };

  let currentScript = null;
  let currentBlock = null;
  let blockStack = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Event handler: when play clicked
    if (line.startsWith('when') && line.includes('clicked')) {
      currentScript = {
        type: 'event',
        event: 'play_clicked',
        children: []
      };
      ast.scripts.push(currentScript);
      currentBlock = currentScript;
      blockStack = [currentScript];
      continue;
    }

    // Event handler: when key pressed
    if (line.startsWith('when') && line.includes('key pressed')) {
      const match = line.match(/when \[(\w+)\] key pressed/);
      const key = match ? match[1] : 'space';
      currentScript = {
        type: 'event',
        event: 'key_pressed',
        params: { key },
        children: []
      };
      ast.scripts.push(currentScript);
      currentBlock = currentScript;
      blockStack = [currentScript];
      continue;
    }

    // Control: repeat N times
    if (line.startsWith('repeat') && line.includes('times')) {
      const match = line.match(/repeat (\d+) times/);
      const count = match ? parseInt(match[1], 10) : 1;
      const repeatBlock = {
        type: 'control',
        control: 'repeat',
        params: { count },
        children: []
      };
      
      if (currentBlock) {
        currentBlock.children.push(repeatBlock);
        blockStack.push(currentBlock);
        currentBlock = repeatBlock;
      }
      continue;
    }

    // Control: forever
    if (line === 'forever') {
      const foreverBlock = {
        type: 'control',
        control: 'forever',
        children: []
      };
      
      if (currentBlock) {
        currentBlock.children.push(foreverBlock);
        blockStack.push(currentBlock);
        currentBlock = foreverBlock;
      }
      continue;
    }

    // Control: if [condition]
    if (line.startsWith('if')) {
      const match = line.match(/if \[(.+)\]/);
      const condition = match ? match[1] : 'true';
      const ifBlock = {
        type: 'control',
        control: 'if',
        params: { condition },
        children: []
      };
      
      if (currentBlock) {
        currentBlock.children.push(ifBlock);
        blockStack.push(currentBlock);
        currentBlock = ifBlock;
      }
      continue;
    }

    // End block (closes control structures)
    if (line === 'end') {
      if (blockStack.length > 1) {
        blockStack.pop();
        currentBlock = blockStack[blockStack.length - 1];
      }
      continue;
    }

    // Action: move forward
    if (line === 'move forward') {
      if (currentBlock) {
        currentBlock.children.push({
          type: 'action',
          action: 'move_forward',
          params: { steps: 1 }
        });
      }
      continue;
    }

    // Action: turn left
    if (line === 'turn left') {
      if (currentBlock) {
        currentBlock.children.push({
          type: 'action',
          action: 'turn_left',
          params: { degrees: 90 }
        });
      }
      continue;
    }

    // Action: turn right
    if (line === 'turn right') {
      if (currentBlock) {
        currentBlock.children.push({
          type: 'action',
          action: 'turn_right',
          params: { degrees: 90 }
        });
      }
      continue;
    }

    // Action: place [block] block
    if (line.includes('place') && line.includes('block')) {
      const match = line.match(/place (\w+) block/);
      const blockId = match ? match[1] : 'grass';
      if (currentBlock) {
        currentBlock.children.push({
          type: 'action',
          action: 'place_block',
          params: { blockId, target: 'pointer' }
        });
      }
      continue;
    }

    // Action: break block
    if (line === 'break block') {
      if (currentBlock) {
        currentBlock.children.push({
          type: 'action',
          action: 'break_block',
          params: { target: 'pointer' }
        });
      }
      continue;
    }
  }

  return ast;
}

/**
 * Validates that the AST is well-formed
 */
export function validateAST(ast) {
  const errors = [];

  if (!ast || ast.type !== 'program') {
    errors.push('Invalid AST: must be a program node');
    return { valid: false, errors };
  }

  if (!ast.scripts || !Array.isArray(ast.scripts)) {
    errors.push('Invalid AST: scripts must be an array');
    return { valid: false, errors };
  }

  // Validate each script starts with an event
  ast.scripts.forEach((script, index) => {
    if (script.type !== 'event') {
      errors.push(`Script ${index}: must start with an event handler`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Compiles AST to opcodes (simplified for Phase 1)
 */
export function compileToOpcodes(ast) {
  const opcodes = [];
  
  function processNode(node) {
    if (node.type === 'event') {
      opcodes.push({
        opcode: 'EVENT_HANDLER',
        params: { event: node.event, ...node.params }
      });
      node.children?.forEach(processNode);
    } else if (node.type === 'control') {
      if (node.control === 'repeat') {
        opcodes.push({
          opcode: 'CONTROL_REPEAT_START',
          params: { count: node.params.count }
        });
        node.children?.forEach(processNode);
        opcodes.push({ opcode: 'CONTROL_REPEAT_END' });
      } else if (node.control === 'forever') {
        opcodes.push({ opcode: 'CONTROL_FOREVER_START' });
        node.children?.forEach(processNode);
        opcodes.push({ opcode: 'CONTROL_FOREVER_END' });
      } else if (node.control === 'if') {
        opcodes.push({
          opcode: 'CONTROL_IF',
          params: { condition: node.params.condition }
        });
        node.children?.forEach(processNode);
        opcodes.push({ opcode: 'CONTROL_IF_END' });
      }
    } else if (node.type === 'action') {
      const opcodeMap = {
        move_forward: 'PLAYER_MOVE_FORWARD',
        turn_left: 'PLAYER_TURN_LEFT',
        turn_right: 'PLAYER_TURN_RIGHT',
        place_block: 'WORLD_PUT_BLOCK',
        break_block: 'WORLD_BREAK_BLOCK'
      };
      
      const opcode = opcodeMap[node.action];
      if (opcode) {
        opcodes.push({
          opcode,
          params: node.params
        });
      }
    }
  }

  ast.scripts?.forEach(processNode);
  return opcodes;
}