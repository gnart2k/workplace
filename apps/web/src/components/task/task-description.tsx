import useUpdateTask from "@/hooks/mutations/task/use-update-task";
import useGetTask from "@/hooks/queries/task/use-get-task";
import { Route } from "@/routes/_layout/_authenticated/dashboard/workspace/$workspaceId/project/$projectId/task/$taskId_";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Editor } from "../common/editor";
import { Button } from "../ui/button";
import { Form, FormField } from "../ui/form";

interface TaskDescriptionProps {
  setIsSaving: (isSaving: boolean) => void;
  isSaving: boolean;
}

function TaskDescription({ setIsSaving, isSaving }: TaskDescriptionProps) {
  const { taskId } = Route.useParams();
  const { data: task } = useGetTask(taskId);
  const { mutateAsync: updateTask } = useUpdateTask();

  const form = useForm<{
    description: string;
  }>({
    shouldUnregister: true,
  });

  useEffect(() => {
    if (task) {
      form.reset({
        description: task.description || "",
      });
    }
  }, [task, form]);

  async function handleSave() {
    if (!task || !form.formState.isDirty) return;

    setIsSaving(true);
    await updateTask({
      ...task,
      description: form.getValues("description"),
      userId: task.userId || "",
      title: task.title || "",
      status: task.status || "",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      priority: task.priority || "",
      position: task.position || 0,
    });
    setIsSaving(false);
    form.reset(form.getValues());
  }

  return (
    <div className="space-y-2">
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="h-[300px]">
          <Form {...form}>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <Editor
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder="Add a description to help your team understand this task..."
                />
              )}
            />
          </Form>
        </div>
        {(form.formState.isDirty || isSaving) && (
          <div className="p-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={!form.formState.isDirty || isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskDescription;
