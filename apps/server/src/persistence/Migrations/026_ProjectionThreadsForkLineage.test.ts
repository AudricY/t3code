import { assert, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import * as SqlClient from "effect/unstable/sql/SqlClient";

import { runMigrations } from "../Migrations.ts";
import * as NodeSqliteClient from "../NodeSqliteClient.ts";

const layer = it.layer(Layer.mergeAll(NodeSqliteClient.layerMemory()));

layer("026_ProjectionThreadsForkLineage", (it) => {
  it.effect("adds forked_from_thread_id and forked_from_turn_id columns", () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      yield* runMigrations({ toMigrationInclusive: 25 });

      const before = yield* sql<{ readonly name: string }>`
        PRAGMA table_info(projection_threads)
      `;
      assert.ok(!before.some((column) => column.name === "forked_from_thread_id"));
      assert.ok(!before.some((column) => column.name === "forked_from_turn_id"));

      yield* runMigrations({ toMigrationInclusive: 26 });

      const after = yield* sql<{ readonly name: string }>`
        PRAGMA table_info(projection_threads)
      `;
      assert.ok(after.some((column) => column.name === "forked_from_thread_id"));
      assert.ok(after.some((column) => column.name === "forked_from_turn_id"));
    }),
  );

  it.effect("is idempotent", () =>
    Effect.gen(function* () {
      yield* runMigrations({ toMigrationInclusive: 26 });
      yield* runMigrations({ toMigrationInclusive: 26 });
    }),
  );
});
