import { detectColdStart, median } from './cold-start';

describe('median', () => {
  it('handles odd and even lengths', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(3);
  });
});

describe('detectColdStart', () => {
  const warm = [180, 200, 210, 190, 220];

  it('needs enough history', () => {
    expect(detectColdStart(9_000, [200, 210])).toBeNull();
  });

  it('flags responses far above the baseline', () => {
    expect(detectColdStart(4_200, warm)).toEqual({ baselineMs: 200 });
  });

  it('ignores slowdowns under the absolute floor', () => {
    // 3x slower but only 400ms more: noise, not a cold start.
    expect(detectColdStart(600, warm)).toBeNull();
  });

  it('ignores big absolute but small relative slowdowns', () => {
    expect(
      detectColdStart(3_500, [2_000, 2_100, 1_900, 2_050, 1_950]),
    ).toBeNull();
  });
});
