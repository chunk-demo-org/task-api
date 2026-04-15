// This test simulates an async data fetch using setTimeout.
// The result is set at 80ms; the assertion fires at 100ms.
// Under normal conditions the 80ms timer completes first.
// Under CI load, the 80ms timer can run late, causing the
// assertion to fire against null — a classic timing-dependent flake.

describe('async task fetch', () => {
  it('fetches task data asynchronously', (done) => {
    let result: { id: string; title: string } | null = null;

    // Simulate async data fetch — sets result at 80ms
    setTimeout(() => {
      result = { id: '1', title: 'Test task' };
    }, 80);

    // Assert at 100ms — assumes the 80ms timer has already fired
    setTimeout(() => {
      expect(result).not.toBeNull();
      expect(result!.title).toBe('Test task');
      done();
    }, 100);
  });
});
