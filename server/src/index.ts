import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import Elysia, { t } from "elysia";
import * as schema from "./schema";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

const db = drizzle(new Database(process.env.DATABASE_URL), { schema });

migrate(db, { migrationsFolder: "./drizzle" });

export type App = typeof app;

const app = new Elysia()
  .decorate("db", db)
  .get("/issues", function getIssues({ db }) {
    return db.query.issues.findMany();
  })
  .get("/issues/:issueId", async function getIssue({ db, params, error }) {
    const issue = await db.query.issues.findFirst({
      where: eq(schema.issues.id, params.issueId),
    });

    if (!issue) return error(404);

    return issue;
  })
  .post(
    "/issues",
    async function postIssues({ body, db }) {
      const newIssue = await db
        .insert(schema.issues)
        .values([body])
        .returning();

      console.log(newIssue);

      return newIssue[0];
    },
    {
      body: t.Object({
        title: t.String(),
        description: t.String(),
      }),
    }
  )
  .patch(
    "/issues/:issueId",
    async function patchIssue({ db, body, error, params }) {
      if (!body.description && !body.title) return error(422);

      const updatedIssue = await db
        .update(schema.issues)
        .set(body)
        .where(eq(schema.issues.id, params.issueId))
        .returning();

      if (updatedIssue.length === 0) {
        return error(404);
      }

      console.log(updatedIssue[0]);

      return updatedIssue[0];
    },
    {
      body: t.Object({
        title: t.Optional(t.String()),
        description: t.Optional(t.String()),
      }),
    }
  )
  .delete(
    "/issues/:issueId",
    async function deleteIssue({ db, params, error }) {
      const deletedIssue = await db
        .delete(schema.issues)
        .where(eq(schema.issues.id, params.issueId))
        .returning();

      if (deletedIssue.length === 0) {
        return error(404);
      }

      return deletedIssue[0];
    }
  )
  .compile()
  .onStart(async function onStart({ server }) {
    console.log(`Server running at ${server?.hostname}:${server?.port}`);
  })
  .listen({
    hostname: "0.0.0.0",
    port: 8080,
  });
