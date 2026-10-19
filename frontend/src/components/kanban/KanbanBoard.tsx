import React, { useState } from 'react';
import { TaskItem } from '../../types';
import { useProjectStore } from '../../stores/projectStore';
import {
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Tag,
  Bug,
} from 'lucide-react';
import { Modal } from '../common/Modal';

const COLUMNS: { id: TaskItem['status']; title: string; color: string }[] = [
  { id: 'backlog', title: 'Backlog', color: 'border-slate-500/40' },
  { id: 'todo', title: 'To Do', color: 'border-blue-500/40' },
  { id: 'in_progress', title: 'In Progress', color: 'border-amber-500/40' },
  { id: 'review', title: 'In Review', color: 'border-purple-500/40' },
  { id: 'done', title: 'Completed', color: 'border-emerald-500/40' },
];

export const KanbanBoard: React.FC = () => {
  const { tasks, moveTask, addTask } = useProjectStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskItem['priority']>('medium');
  const [status, setStatus] = useState<TaskItem['status']>('todo');
  const [tags, setTags] = useState('Frontend, Refactor');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title,
      description,
      priority,
      status,
      dueDate: 'In 3 days',
      tags: tags.split(',').map((t) => t.trim()),
      assignee: {
        name: 'Alex Rivera',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      },
    });

    setTitle('');
    setDescription('');
    setIsModalOpen(false);
  };

  const getPriorityBadge = (p: TaskItem['priority']) => {
    switch (p) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-500 border border-rose-500/30">Urgent</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-500 border border-blue-500/30">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30">Low</span>;
    }
  };

  const getNextStatus = (current: TaskItem['status']): TaskItem['status'] | null => {
    const order: TaskItem['status'][] = ['backlog', 'todo', 'in_progress', 'review', 'done'];
    const idx = order.indexOf(current);
    return idx < order.length - 1 ? order[idx + 1] : null;
  };

  const getPrevStatus = (current: TaskItem['status']): TaskItem['status'] | null => {
    const order: TaskItem['status'][] = ['backlog', 'todo', 'in_progress', 'review', 'done'];
    const idx = order.indexOf(current);
    return idx > 0 ? order[idx - 1] : null;
  };

  return (
    <div className="space-y-4">
      {/* Board Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Sprint Task Board</h3>
          <p className="text-xs text-muted-foreground">Manage refactoring and bug resolution workflows</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Add Task
        </button>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className={`bg-muted/30 rounded-xl border-t-4 ${col.color} border-x border-b border-border p-3 flex flex-col min-h-[500px]`}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {col.title}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-card border border-border text-muted-foreground font-semibold">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="h-28 flex items-center justify-center text-[11px] text-muted-foreground border border-dashed border-border rounded-lg">
                    No tasks
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="animated-card card-shimmer bg-card text-card-foreground rounded-xl border border-border p-3.5 shadow-xs space-y-2 hover:border-primary/60 hover:shadow-md cursor-grab active:cursor-grabbing group animate-scale-in"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-muted-foreground group-hover:text-primary transition-colors">{task.id}</span>
                        {getPriorityBadge(task.priority)}
                      </div>

                      <h4 className="text-xs font-semibold text-foreground line-clamp-2">
                        {task.title}
                      </h4>

                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {task.description}
                      </p>

                      {task.bugIssueId && (
                        <div className="inline-flex items-center gap-1 text-[10px] text-rose-500 font-medium">
                          <Bug className="w-3 h-3" />
                          <span>Linked: {task.bugIssueId}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((tg, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                          >
                            #{tg}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/60">
                        <div className="flex items-center gap-1.5">
                          <img
                            src={task.assignee.avatarUrl}
                            alt={task.assignee.name}
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                            {task.assignee.name.split(' ')[0]}
                          </span>
                        </div>

                        {/* Move controls */}
                        <div className="flex items-center gap-1">
                          {getPrevStatus(task.status) && (
                            <button
                              onClick={() => moveTask(task.id, getPrevStatus(task.status)!)}
                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                              title="Move back"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                          )}
                          {getNextStatus(task.status) && (
                            <button
                              onClick={() => moveTask(task.id, getNextStatus(task.status)!)}
                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                              title="Move forward"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Sprint Task"
        description="Assign refactoring or security patch tasks to developers"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Task Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Patch SQL injection in repository query helper"
              className="w-full text-xs bg-muted/60 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed acceptance criteria and technical notes..."
              className="w-full text-xs bg-muted/60 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full text-xs bg-muted/60 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent (P0)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Column</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
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
            <label className="text-xs font-semibold text-foreground block mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Security, Backend, Go"
              className="w-full text-xs bg-muted/60 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-primary text-white hover:bg-primary/90 rounded-lg shadow-sm"
            >
              Create Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

