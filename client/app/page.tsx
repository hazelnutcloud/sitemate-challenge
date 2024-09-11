"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";
import {
  getIssues,
  createIssue,
  updateIssue,
  deleteIssue,
  type Issue,
} from "./actions";

export default function IssueTracker() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchIssues = async () => {
      const fetchedIssues = await getIssues();
      setIssues(fetchedIssues);
    };
    fetchIssues();
  }, []);

  const handleCreateIssue = async (formData: FormData) => {
    startTransition(async () => {
      await createIssue(formData);
      const updatedIssues = await getIssues();
      setIssues(updatedIssues);
      formRef.current?.reset();
    });
  };

  const handleUpdateIssue = async (formData: FormData) => {
    startTransition(async () => {
      await updateIssue(formData);
      const updatedIssues = await getIssues();
      setIssues(updatedIssues);
      setCurrentIssue(null);
      formRef.current?.reset();
    });
  };

  const handleDeleteIssue = async (id: string) => {
    startTransition(async () => {
      await deleteIssue(id);
      const updatedIssues = await getIssues();
      setIssues(updatedIssues);
    });
  };

  const startEditing = (issue: Issue) => {
    setCurrentIssue(issue);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Issue Tracker</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={currentIssue ? "border-primary" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {currentIssue ? "Edit Issue" : "Create New Issue"}
            </CardTitle>
            {currentIssue && (
              <Button variant="outline" onClick={() => setCurrentIssue(null)}>
                New Issue
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <form
              ref={formRef}
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                if (currentIssue) {
                  handleUpdateIssue(formData);
                } else {
                  handleCreateIssue(formData);
                }
              }}
              className="space-y-4"
            >
              {currentIssue && (
                <Input type="hidden" name="id" value={currentIssue.id} />
              )}
              <Input
                name="title"
                placeholder="Issue Title"
                defaultValue={currentIssue?.title || ""}
                required
              />
              <Textarea
                name="description"
                placeholder="Issue Description"
                defaultValue={currentIssue?.description || ""}
                required
              />
              <div className="flex justify-end space-x-2">
                {currentIssue && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentIssue(null)}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={isPending}>
                  {isPending
                    ? "Submitting..."
                    : currentIssue
                    ? "Update"
                    : "Create"}{" "}
                  Issue
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Issues</CardTitle>
          </CardHeader>
          <CardContent>
            {issues.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No issues found.
              </p>
            ) : (
              <ul className="space-y-4">
                {issues.map((issue) => (
                  <li
                    key={issue.id}
                    className="flex items-center justify-between p-4 border rounded"
                  >
                    <div>
                      <h3 className="font-semibold">{issue.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {issue.description}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => startEditing(issue)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit issue</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleDeleteIssue(issue.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete issue</span>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
