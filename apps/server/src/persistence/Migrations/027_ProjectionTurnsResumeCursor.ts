import * as Effect from "effect/Effect";
import * as SqlClient from "effect/unstable/sql/SqlClient";

export default Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const columns = yield* sql<{ readonly name: string }>`
    PRAGMA table_info(projection_turns)
  `;

  const existing = new Set(columns.map((column) => column.name));

  if (!existing.has("resume_cursor_json")) {
    yield* sql`
      ALTER TABLE projection_turns
      ADD COLUMN resume_cursor_json TEXT
    `;
  }
});
