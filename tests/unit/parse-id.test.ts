import { describe, expect, it } from 'vitest';
import { parseId } from '@/lib/utils/parseId';

describe('parseId', () => {
  it('повертає число для додатного цілого id', () => {
    expect(parseId('3')).toBe(3);
  });

  it.each(['abc', '0', '-5', '1.5', '', '1e3x'])('повертає null для "%s"', value => {
    expect(parseId(value)).toBeNull();
  });
});
