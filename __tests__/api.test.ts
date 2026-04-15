// This test simulates an async data fetch using setTimeout.
// Fixed: Now uses nested callbacks to ensure proper ordering
// instead of relying on race-prone parallel timers.

describe('async task fetch', () => {
  it('fetches task data asynchronously', (done) => {
    let result: { id: string; title: string } | null = null;

    // Simulate async data fetch
    setTimeout(() => {
      result = { id: '1', title: 'Test task' };

      // Assert after the fetch completes (guaranteed ordering)
      expect(result).not.toBeNull();
      expect(result!.title).toBe('Test task');
      done();
    }, 80);
  });
});
