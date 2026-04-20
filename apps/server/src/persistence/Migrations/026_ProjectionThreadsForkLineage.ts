import * as Effect from "effect/Effect";
import * as SqlClient from "effect/unstable/sql/SqlClient";

export default Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const columns = yield* sql<{ readonly name: string }>`
    PRAGMA table_info(projection_threads)
  `;

  const existing = new Set(columns.map((column) => column.name));

  if (!existing.has("forked_from_thread_id")) {
    yield* sql`
      ALTER TABLE projection_threads
      ADD COLUMN forked_from_thread_id TEXT
    `;
  }

  if (!existing.has("forked_from_turn_id")) {
    yield* sql`
      ALTER TABLE projection_threads
      ADD COLUMN forked_from_turn_id TEXT
    `;
  }
});
