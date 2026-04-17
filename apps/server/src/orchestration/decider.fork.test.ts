import {
  CheckpointRef,
  CommandId,
  EventId,
  MessageId,
  ProjectId,
  ThreadId,
  TurnId,
  type OrchestrationEvent,
  type OrchestrationReadModel,
} from "@t3tools/contracts";
import { describe, expect, it } from "vitest";
import { Effect } from "effect";

import { decideOrchestrationCommand } from "./decider.ts";
import { createEmptyReadModel, projectEvent } from "./projector.ts";

const NOW = "2026-04-17T00:00:00.000Z";
const LATER = "2026-04-17T00:00:01.000Z";
const LATEST = "2026-04-17T00:00:02.000Z";

const PROJECT_ID = ProjectId.make("project-fork");
const SOURCE_THREAD_ID = ThreadId.make("thread-source");
const NEW_THREAD_ID = ThreadId.make("thread-new");
const TURN_1 = TurnId.make("turn-1");
const TURN_2 = TurnId.make("turn-2");

async function buildSourceThreadReadModel(
  options: {
    includeSecondTurn?: boolean;
    activeTurnId?: TurnId | null;
    sessionStatus?: "running" | "ready";
  } = {},
): Promise<OrchestrationReadModel> {
  const includeSecondTurn = options.includeSecondTurn ?? true;
  let model = createEmptyReadModel(NOW);

  model = await Effect.runPromise(
    projectEvent(model, {
      sequence: 1,
      eventId: EventId.make("evt-1"),
      aggregateKind: "project",
      aggregateId: PROJECT_ID,
      type: "project.created",
      occurredAt: NOW,
      commandId: CommandId.make("cmd-1"),
      causationEventId: null,
      correlationId: CommandId.make("cmd-1"),
      metadata: {},
      payload: {
        projectId: PROJECT_ID,
        title: "Project",
        workspaceRoot: "/tmp",
        defaultModelSelection: null,
        scripts: [],
        createdAt: NOW,
        updatedAt: NOW,
      },
    }),
  );

  model = await Effect.runPromise(
    projectEvent(model, {
      sequence: 2,
      eventId: EventId.make("evt-2"),
      aggregateKind: "thread",
      aggregateId: SOURCE_THREAD_ID,
      type: "thread.created",
      occurredAt: NOW,
      commandId: CommandId.make("cmd-2"),
      causationEventId: null,
      correlationId: CommandId.make("cmd-2"),
      metadata: {},
      payload: {
        threadId: SOURCE_THREAD_ID,
        projectId: PROJECT_ID,
        title: "Source",
        modelSelection: { provider: "codex", model: "gpt-5" },
        runtimeMode: "full-access",
        interactionMode: "default",
        branch: null,
        worktreePath: null,
        createdAt: NOW,
        updatedAt: NOW,
      },
    }),
  );

  model = await Effect.runPromise(
    projectEvent(model, {
      sequence: 3,
      eventId: EventId.make("evt-3"),
      aggregateKind: "thread",
      aggregateId: SOURCE_THREAD_ID,
      type: "thread.message-sent",
      occurredAt: NOW,
      commandId: CommandId.make("cmd-3"),
      causationEventId: null,
      correlationId: CommandId.make("cmd-3"),
      metadata: {},
      payload: {
        threadId: SOURCE_THREAD_ID,
        messageId: MessageId.make("msg-user-1"),
        role: "user",
        text: "hello",
        turnId: null,
        streaming: false,
        createdAt: NOW,
        updatedAt: NOW,
      },
    }),
  );

  model = await Effect.runPromise(
    projectEvent(model, {
      sequence: 4,
      eventId: EventId.make("evt-4"),
      aggregateKind: "thread",
      aggregateId: SOURCE_THREAD_ID,
      type: "thread.message-sent",
      occurredAt: LATER,
      commandId: CommandId.make("cmd-4"),
      causationEventId: null,
      correlationId: CommandId.make("cmd-4"),
      metadata: {},
      payload: {
        threadId: SOURCE_THREAD_ID,
        messageId: MessageId.make("msg-asst-1"),
        role: "assistant",
        text: "hi",
        turnId: TURN_1,
        streaming: false,
        createdAt: LATER,
        updatedAt: LATER,
      },
    }),
  );

  model = await Effect.runPromise(
    projectEvent(model, {
      sequence: 5,
      eventId: EventId.make("evt-5"),
      aggregateKind: "thread",
      aggregateId: SOURCE_THREAD_ID,
      type: "thread.turn-diff-completed",
      occurredAt: LATER,
      commandId: CommandId.make("cmd-5"),
      causationEventId: null,
      correlationId: CommandId.make("cmd-5"),
      metadata: {},
      payload: {
        threadId: SOURCE_THREAD_ID,
        turnId: TURN_1,
        checkpointTurnCount: 1,
        checkpointRef: CheckpointRef.make("refs/t3/checkpoints/source/turn/1"),
        status: "ready",
        files: [],
        assistantMessageId: MessageId.make("msg-asst-1"),
        completedAt: LATER,
      },
    }),
  );

  if (includeSecondTurn) {
    model = await Effect.runPromise(
      projectEvent(model, {
        sequence: 6,
        eventId: EventId.make("evt-6"),
        aggregateKind: "thread",
        aggregateId: SOURCE_THREAD_ID,
        type: "thread.message-sent",
        occurredAt: LATEST,
        commandId: CommandId.make("cmd-6"),
        causationEventId: null,
        correlationId: CommandId.make("cmd-6"),
        metadata: {},
        payload: {
          threadId: SOURCE_THREAD_ID,
          messageId: MessageId.make("msg-user-2"),
          role: "user",
          text: "next",
          turnId: null,
          streaming: false,
          createdAt: LATEST,
          updatedAt: LATEST,
        },
      }),
    );

    model = await Effect.runPromise(
      projectEvent(model, {
        sequence: 7,
        eventId: EventId.make("evt-7"),
        aggregateKind: "thread",
        aggregateId: SOURCE_THREAD_ID,
        type: "thread.message-sent",
        occurredAt: LATEST,
        commandId: CommandId.make("cmd-7"),
        causationEventId: null,
        correlationId: CommandId.make("cmd-7"),
        metadata: {},
        payload: {
          threadId: SOURCE_THREAD_ID,
          messageId: MessageId.make("msg-asst-2"),
          role: "assistant",
          text: "ok",
          turnId: TURN_2,
          streaming: false,
          createdAt: LATEST,
          updatedAt: LATEST,
        },
      }),
    );

    model = await Effect.runPromise(
      projectEvent(model, {
        sequence: 8,
        eventId: EventId.make("evt-8"),
        aggregateKind: "thread",
        aggregateId: SOURCE_THREAD_ID,
        type: "thread.turn-diff-completed",
        occurredAt: LATEST,
        commandId: CommandId.make("cmd-8"),
        causationEventId: null,
        correlationId: CommandId.make("cmd-8"),
        metadata: {},
        payload: {
          threadId: SOURCE_THREAD_ID,
          turnId: TURN_2,
          checkpointTurnCount: 2,
          checkpointRef: CheckpointRef.make("refs/t3/checkpoints/source/turn/2"),
          status: "ready",
          files: [],
          assistantMessageId: MessageId.make("msg-asst-2"),
          completedAt: LATEST,
        },
      }),
    );
  }

  if (options.sessionStatus !== undefined) {
    model = await Effect.runPromise(
      projectEvent(model, {
        sequence: 9,
        eventId: EventId.make("evt-9"),
        aggregateKind: "thread",
        aggregateId: SOURCE_THREAD_ID,
        type: "thread.session-set",
        occurredAt: LATEST,
        commandId: CommandId.make("cmd-9"),
        causationEventId: null,
        correlationId: CommandId.make("cmd-9"),
        metadata: {},
        payload: {
          threadId: SOURCE_THREAD_ID,
          session: {
            threadId: SOURCE_THREAD_ID,
            status: options.sessionStatus,
            providerName: "codex",
            runtimeMode: "full-access",
            activeTurnId: options.activeTurnId ?? null,
            lastError: null,
            updatedAt: LATEST,
          },
        },
      }),
    );
  }

  return model;
}

describe("decider thread.fork", () => {
  it("emits thread.forked with ancestor messages snapshotted at fork point", async () => {
    const readModel = await buildSourceThreadReadModel();

    const result = await Effect.runPromise(
      decideOrchestrationCommand({
        command: {
          type: "thread.fork",
          commandId: CommandId.make("cmd-fork"),
          threadId: NEW_THREAD_ID,
          sourceThreadId: SOURCE_THREAD_ID,
          sourceTurnId: TURN_1,
          title: "Fork at turn 1",
          createdAt: NOW,
        },
        readModel,
      }),
    );

    const event = (Array.isArray(result) ? result[0] : result) as Extract<
      OrchestrationEvent,
      { readonly type: "thread.forked" }
    >;
    expect(event.type).toBe("thread.forked");
    expect(event.payload.threadId).toBe(NEW_THREAD_ID);
    expect(event.payload.forkedFromThreadId).toBe(SOURCE_THREAD_ID);
    expect(event.payload.forkedFromTurnId).toBe(TURN_1);
    expect(event.payload.messagesSnapshot).toHaveLength(2);
    expect(event.payload.messagesSnapshot.map((message) => message.text)).toEqual(["hello", "hi"]);
    for (const message of event.payload.messagesSnapshot) {
      expect(message.id).not.toBe("msg-user-1");
      expect(message.id).not.toBe("msg-asst-1");
      expect(message.streaming).toBe(false);
    }
  });

  it("snapshots all ancestor messages when forking from latest turn", async () => {
    const readModel = await buildSourceThreadReadModel();

    const result = await Effect.runPromise(
      decideOrchestrationCommand({
        command: {
          type: "thread.fork",
          commandId: CommandId.make("cmd-fork-2"),
          threadId: NEW_THREAD_ID,
          sourceThreadId: SOURCE_THREAD_ID,
          sourceTurnId: TURN_2,
          title: "Fork at turn 2",
          createdAt: NOW,
        },
        readModel,
      }),
    );

    const event = (Array.isArray(result) ? result[0] : result) as Extract<
      OrchestrationEvent,
      { readonly type: "thread.forked" }
    >;
    expect(event.payload.messagesSnapshot).toHaveLength(4);
  });

  it("inherits source thread defaults when overrides absent", async () => {
    const readModel = await buildSourceThreadReadModel();

    const result = await Effect.runPromise(
      decideOrchestrationCommand({
        command: {
          type: "thread.fork",
          commandId: CommandId.make("cmd-fork-3"),
          threadId: NEW_THREAD_ID,
          sourceThreadId: SOURCE_THREAD_ID,
          sourceTurnId: TURN_1,
          title: "Fork inherits",
          createdAt: NOW,
        },
        readModel,
      }),
    );

    const event = (Array.isArray(result) ? result[0] : result) as Extract<
      OrchestrationEvent,
      { readonly type: "thread.forked" }
    >;
    expect(event.payload.modelSelection).toEqual({ provider: "codex", model: "gpt-5" });
    expect(event.payload.runtimeMode).toBe("full-access");
    expect(event.payload.interactionMode).toBe("default");
  });

  it("rejects fork from missing source thread", async () => {
    const readModel = createEmptyReadModel(NOW);

    const exit = await Effect.runPromiseExit(
      decideOrchestrationCommand({
        command: {
          type: "thread.fork",
          commandId: CommandId.make("cmd-fork-missing"),
          threadId: NEW_THREAD_ID,
          sourceThreadId: SOURCE_THREAD_ID,
          sourceTurnId: TURN_1,
          title: "Fork",
          createdAt: NOW,
        },
        readModel,
      }),
    );
    expect(exit._tag).toBe("Failure");
  });

  it("rejects fork when target thread already exists", async () => {
    const readModel = await buildSourceThreadReadModel();

    const exit = await Effect.runPromiseExit(
      decideOrchestrationCommand({
        command: {
          type: "thread.fork",
          commandId: CommandId.make("cmd-fork-collision"),
          threadId: SOURCE_THREAD_ID,
          sourceThreadId: SOURCE_THREAD_ID,
          sourceTurnId: TURN_1,
          title: "Fork",
          createdAt: NOW,
        },
        readModel,
      }),
    );
    expect(exit._tag).toBe("Failure");
  });

  it("rejects fork from unknown turn", async () => {
    const readModel = await buildSourceThreadReadModel();

    const exit = await Effect.runPromiseExit(
      decideOrchestrationCommand({
        command: {
          type: "thread.fork",
          commandId: CommandId.make("cmd-fork-unknown-turn"),
          threadId: NEW_THREAD_ID,
          sourceThreadId: SOURCE_THREAD_ID,
          sourceTurnId: TurnId.make("turn-unknown"),
          title: "Fork",
          createdAt: NOW,
        },
        readModel,
      }),
    );
    expect(exit._tag).toBe("Failure");
  });

  it("rejects fork from in-flight turn", async () => {
    const readModel = await buildSourceThreadReadModel({
      sessionStatus: "running",
      activeTurnId: TURN_2,
    });

    const exit = await Effect.runPromiseExit(
      decideOrchestrationCommand({
        command: {
          type: "thread.fork",
          commandId: CommandId.make("cmd-fork-inflight"),
          threadId: NEW_THREAD_ID,
          sourceThreadId: SOURCE_THREAD_ID,
          sourceTurnId: TURN_2,
          title: "Fork",
          createdAt: NOW,
        },
        readModel,
      }),
    );
    expect(exit._tag).toBe("Failure");
  });
});
