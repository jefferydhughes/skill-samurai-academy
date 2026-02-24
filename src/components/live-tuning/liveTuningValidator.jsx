/**
 * Live Tuning Validator
 * Validates tuning blocks according to safety rules
 */

import { getTunableByKey } from './tunablesConfig';

const MAX_BLOCKS = 10;
const ALLOWED_OPCODES = ['SET_TUNABLE', 'RESET_TUNABLES'];

export function validateLiveTuning(blocks) {
  const errors = [];
  const warnings = [];

  // Check block count
  if (blocks.length > MAX_BLOCKS) {
    errors.push(`Too many blocks: ${blocks.length}/${MAX_BLOCKS}`);
  }

  // Validate each block
  blocks.forEach((block, index) => {
    const blockErrors = validateBlock(block, index);
    errors.push(...blockErrors);
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function validateBlock(block, index) {
  const errors = [];

  // Check opcode is allowed
  if (!ALLOWED_OPCODES.includes(block.opcode)) {
    errors.push(`Block ${index + 1}: Opcode '${block.opcode}' not allowed in Live Tuning mode`);
    return errors;
  }

  if (block.opcode === 'SET_TUNABLE') {
    const tunable = getTunableByKey(block.key);
    
    if (!tunable) {
      errors.push(`Block ${index + 1}: Unknown tunable '${block.key}'`);
      return errors;
    }

    // Validate value type
    if (tunable.type === 'number') {
      const value = Number(block.value);
      
      if (isNaN(value)) {
        errors.push(`Block ${index + 1}: '${block.key}' must be a number`);
      } else {
        // Check range
        if (tunable.min !== undefined && value < tunable.min) {
          errors.push(`Block ${index + 1}: '${tunable.label}' must be at least ${tunable.min}`);
        }
        if (tunable.max !== undefined && value > tunable.max) {
          errors.push(`Block ${index + 1}: '${tunable.label}' cannot exceed ${tunable.max}`);
        }
      }
    } else if (tunable.type === 'boolean') {
      if (typeof block.value !== 'boolean') {
        errors.push(`Block ${index + 1}: '${block.key}' must be true or false`);
      }
    }
  }

  return errors;
}

/**
 * Compiles blocks to patch object
 */
export function compileToPatch(blocks) {
  const patch = {};
  
  blocks.forEach(block => {
    if (block.opcode === 'SET_TUNABLE') {
      patch[block.key] = block.value;
    }
  });

  return patch;
}