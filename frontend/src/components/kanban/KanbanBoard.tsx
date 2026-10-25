
import React, { useState } from 'react';
import type { TaskItem } from '../../types';
import { useProjectStore } from '../../stores/projectStore';
import {
  Plus,
  ChevronRight,
  ChevronLeft,
  Bug,
} from 'lucide-react';
import { Modal } from '../common/Modal';

const COLUMNS: {
  id: TaskItem['status'];
  title: string;
  color: string;
}[] = [
  { id: 'backlog', title: 'Backlog', color: 'border-slate-500/40' },
  { id: 'todo', title: 'To Do', color: 'border-blue-500/40' },
  { id: 'in_progress', title: 'In Progress', color: 'border-amber-500/40' },
  { id: 'review', title: 'In Review', color: 'border-purple-500/40' },
  { id: 'done', title: 'Completed', color: 'border-emerald-500/40' },
];

export const KanbanBoard: React.FC = () => {
  const {
    tasks,
    moveTask,
    addTask,
    isSavingTask,
    isLoadingTasks,
    error,
    clearError,
    selectedProject,
  } = useProjectStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] =
    useState<TaskItem['priority']>('medium');
  const [status, setStatus] =
    useState<TaskItem['status']>('todo');
  const [tags, setTags] = useState('');
  const [movingTaskIds, setMovingTaskIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('A task title is required.');
      return;
    }

    if (!selectedProject) {
      setFormError('Select a project before creating a task.');
      return;
    }

    if (isSavingTask) return;

    try {
      await addTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        dueDate: null,
      });

      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('todo');
      setTags('');
      setIsModalOpen(false);
    } catch {
      // The store retains the API error. Keep the modal open for retry.
    }
  };

  const handleMoveTask = async (
    taskId: string,
    newStatus: TaskItem['status']
  ) => {
    if (movingTaskIds.includes(taskId)) return;

    setMovingTaskIds((current) => [...current, taskId]);

    try {
      await moveTask(taskId, newStatus);
    } finally {
      setMovingTaskIds((current) =>
        current.filter((id) => id !== taskId)
      );
    }
  };

  const getPriorityBadge = (value: TaskItem['priority']) => {
    switch (value) {
      case 'urgent':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-500 border border-rose-500/30">
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-500 border border-blue-500/30">
            Medium
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30">
            Low
          </span>
        );
    }
  };

  const getNextStatus = (
    current: TaskItem['status']
  ): TaskItem['status'] | null => {
    const index = COLUMNS.findIndex((column) => column.id === current);
    return index >= 0 && index < COLUMNS.length - 1
      ? COLUMNS[index + 1].id
      : null;
  };

  const getPrevStatus = (
    current: TaskItem['status']
  ): TaskItem['status'] | null => {
    const index = COLUMNS.findIndex((column) => column.id === current);
    return index > 0 ? COLUMNS[index - 1].id : null;
  };

  return (
    <div className="space-y-4">
      {/* Board Controls */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Sprint Task Board
          </h3>
          <p className="text-xs text-muted-foreground">
            Manage refactoring and bug resolution workflows
          </p>
          {selectedProject && (
            <p className="mt-1 text-xs text-muted-foreground">
              Project: {selectedProject.name}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setIsModalOpen(true);
          }}
          disabled={!selectedProject}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Task
        </button>
      </div>

      {/* Backend / validation errors */}
      {(error || formError) && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500"
        >
          <span>{formError || error}</span>
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              clearError();
            }}
            className="shrink-0 rounded px-2 py-1 hover:bg-rose-500/10"
          >
            Dismiss
          </button>
        </div>
      )}

      {!selectedProject && (
        <div className="rounded-xl border border-border bg-muted/30 p-6 text-center">
          <p className="text-sm font-medium text-foreground">
            No project selected
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Select or create a project before managing its tasks.
          </p>
        </div>
      )}

      {isLoadingTasks && (
        <p className="text-sm text-muted-foreground" role="status">
          Loading tasks…
        </p>
      )}

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter(
            (task) => task.status === column.id
          );

          return (
            <div
              key={column.id}
              className={`bg-muted/30 rounded-xl border-t-4 ${column.color} border-x border-b border-border p-3 flex flex-col min-h-[500px]`}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {column.title}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-card border border-border text-muted-foreground font-semibold">
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {columnTasks.length === 0 ? (
                  <div className="h-28 flex items-center justify-center text-[11px] text-muted-foreground border border-dashed border-border rounded-lg">
                    {isLoadingTasks ? 'Loading…' : 'No tasks'}
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    const previousStatus = getPrevStatus(task.status);
                    const nextStatus = getNextStatus(task.status);
                    const isMoving = movingTaskIds.includes(task.id);

                    return (
                      <div
                        key={task.id}
                        className="animated-card card-shimmer bg-card text-card-foreground rounded-xl border border-border p-3.5 shadow-xs space-y-2 hover:border-primary/60 hover:shadow-md group animate-scale-in"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="text-[10px] font-mono text-muted-foreground group-hover:text-primary transition-colors truncate"
                            title={task.id}
                          >
                            {task.id}
                          </span>
                          {getPriorityBadge(task.priority)}
                        </div>

                        <h4 className="text-xs font-semibold text-foreground line-clamp-2">
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {task.bugIssueId && (
                          <div className="inline-flex items-center gap-1 text-[10px] text-rose-500 font-medium">
                            <Bug className="w-3 h-3" />
                            <span>Linked: {task.bugIssueId}</span>
                          </div>
                        )}

                        {task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.tags.map((tag, index) => (
                              <span
                                key={`${tag}-${index}`}
                                className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                          <div className="min-w-0">
                            {task.assignee?.name ? (
                              <div className="flex items-center gap-1.5">
                                {task.assignee.avatarUrl ? (
                                  <img
                                    src={task.assignee.avatarUrl}
                                    alt={task.assignee.name}
                                    className="w-5 h-5 rounded-full object-cover"
                                  />
                                ) : (
                                  <div
                                    className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] text-muted-foreground"
                                    aria-hidden="true"
                                  >
                                    {task.assignee.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                                  {task.assignee.name.split(' ')[0]}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">
                                Unassigned
                              </span>
                            )}
                          </div>

                          {/* Persisted move controls */}
                          <div className="flex items-center gap-1">
                            {previousStatus && (
                              <button
                                type="button"
                                onClick={() =>
                                  void handleMoveTask(task.id, previousStatus)
                                }
                                disabled={isMoving || isLoadingTasks}
                                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                                title={`Move to ${COLUMNS.find((item) => item.id === previousStatus)?.title}`}
                                aria-label={`Move ${task.title} backward`}
                              >
                                <ChevronLeft className="w-3 h-3" />
                              </button>
                            )}

                            {nextStatus && (
                              <button
                                type="button"
                                onClick={() =>
                                  void handleMoveTask(task.id, nextStatus)
                                }
                                disabled={isMoving || isLoadingTasks}
                                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                                title={`Move to ${COLUMNS.find((item) => item.id === nextStatus)?.title}`}
                                aria-label={`Move ${task.title} forward`}
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        {isMoving && (
                          <p className="text-[10px] text-muted-foreground">
                            Saving status…
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          if (!isSavingTask) {
            setIsModalOpen(false);
            setFormError(null);
          }
        }}
        title="Create New Sprint Task"
        description="Create a task for your selected project."
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label
              htmlFor="task-title"
              className="text-xs font-semibold text-foreground block mb-1"
            >
              Task Title
            </label>
            <input
              id="task-title"
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Patch SQL injection in repository query helper"
              className="w-full text-xs bg-muted/60 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label
              htmlFor="task-description"
              className="text-xs font-semibold text-foreground block mb-1"
            >
              Description
            </label>
            <textarea
              id="task-description"
              rows={3}
              maxLength={5000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Acceptance criteria and technical notes..."
              className="w-full text-xs bg-muted/60 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="task-priority"
                className="text-xs font-semibold text-foreground block mb-1"
              >
                Priority
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as TaskItem['priority'])
                }
                className="w-full text-xs bg-muted/60 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent (P0)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="task-status"
                className="text-xs font-semibold text-foreground block mb-1"
              >
                Column
              </label>
              <select
                id="task-status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as TaskItem['status'])
                }
                className="w-full text-xs bg-muted/60 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="done">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="task-tags"
              className="text-xs font-semibold text-foreground block mb-1"
            >
              Tags (comma separated)
            </label>
            <input
              id="task-tags"
              type="text"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="Security, Backend, Refactoring"
              className="w-full text-xs bg-muted/60 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {formError && (
            <p role="alert" className="text-xs text-rose-500">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setFormError(null);
              }}
              disabled={isSavingTask}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSavingTask || !selectedProject || !title.trim()}
              className="px-4 py-2 text-xs font-semibold bg-primary text-white hover:bg-primary/90 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingTask ? 'Creating…' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
