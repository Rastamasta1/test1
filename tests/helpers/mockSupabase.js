// Lightweight chainable Supabase query builder mock.
// Usage: const { client, setData, setError } = createMockSupabase();
function createMockSupabase() {
  let nextData = null;
  let nextError = null;

  function makeBuilder() {
    const builder = {};
    const passthrough = [
      'select', 'insert', 'update', 'upsert', 'delete',
      'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'is',
      'order', 'limit', 'range', 'match',
    ];
    for (const m of passthrough) {
      builder[m] = jest.fn(() => builder);
    }
    builder.single = jest.fn(() => Promise.resolve({ data: nextData, error: nextError }));
    builder.maybeSingle = jest.fn(() => Promise.resolve({ data: nextData, error: nextError }));
    // Make the builder thenable so `await query` resolves to a result.
    builder.then = (resolve) => resolve({ data: nextData, error: nextError });
    return builder;
  }

  const client = {
    from: jest.fn(() => makeBuilder()),
  };

  return {
    client,
    setData(data) { nextData = data; nextError = null; },
    setError(error) { nextError = error; nextData = null; },
    reset() { nextData = null; nextError = null; },
  };
}

module.exports = { createMockSupabase };
