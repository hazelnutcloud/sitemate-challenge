import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { ulid } from "ulidx";

export const issues = sqliteTable("issues", {
  id: text("id")
    .primaryKey()
    .$default(() => `issue_${ulid()}`),
  title: text("title").notNull(),
  description: text("description").notNull(),
});
