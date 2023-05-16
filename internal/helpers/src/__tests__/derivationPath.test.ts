import { describe, it, expect } from 'vitest';
import { derivationPathToString } from '../derivationPath.js';

describe('derivationPathToString', () => {
  it('should return the correct string for a full path', () => {
    const path = [1, 2, 3, 4, 5];
    const result = derivationPathToString(path);
    expect(result).toEqual("1'/2'/3'/4/5");
  });

  it('should return the correct string for a short path', () => {
    const path = [1, 2, 3, 4];
    const result = derivationPathToString(path);
    expect(result).toEqual("1'/2'/3'/4");
  });
});
