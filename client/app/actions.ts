"use server";

import { treaty } from "@elysiajs/eden";
import type { App } from "server";

const apiUrl = process.env.API_URL;
if (!apiUrl) throw new Error("API_URL not set");
const client = treaty<App>(apiUrl);

export interface Issue {
  id: string;
  title: string;
  description: string;
}

export async function getIssues(): Promise<Issue[]> {
  const { data, error } = await client.issues.get();

  if (error) {
    throw new Error(error.value as string);
  }

  return data;
}

export async function createIssue(formData: FormData): Promise<Issue> {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  if (!title || !description) {
    throw new Error("Title and description are required");
  }

  const { data, error } = await client.issues.post({ description, title });

  if (error) {
    throw new Error(error.value as string);
  }

  return data;
}

export async function updateIssue(formData: FormData): Promise<Issue> {
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  const { data, error } = await client
    .issues({ issueId: id })
    .patch({ title, description });

  if (error) {
    throw new Error(error.value as string);
  }

  return data;
}

export async function deleteIssue(id: string): Promise<void> {
  const { error } = await client.issues({ issueId: id }).delete();

  if (error) {
    throw new Error(error.value as string);
  }
}
