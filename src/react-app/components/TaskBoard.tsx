import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Trash2, FolderOpen, Tag, Clock } from "lucide-react";
import type { Task } from "@/shared/types";
import { taskStateManager } from "@/react-app/lib/taskStateManager";

interface TaskBoardProps {
  tasks: Task[];
  onUpdate: (id: number, updates: Partial<Task>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  selectedTaskId?: number;
}

export default function TaskBoard({ tasks, onUpdate, onDelete, selectedTaskId }: TaskBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dropTarget, setDropTarget] = useState<"backlog" | "today" | "done" | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<number, Partial<Task>>>(new Map());

  // Apply optimistic updates to tasks
  const getOptimisticTask = (task: Task): Task => {
    const updates = optimisticUpdates.get(task.id);
    if (!updates) return task;
    return { ...task, ...updates };
  };

  const allTasks = tasks.map(getOptimisticTask);

  // Helper to check if task should be in a column
  const isInBacklog = (t: Task) => {
    const result = !t.is_completed && (!t.due_date || t.due_date === '');
    return result;
  };
  const isInToday = (t: Task) => {
    if (t.is_completed) return false;
    if (!t.due_date || t.due_date === '') return false;
    // Compare dates by YYYY-MM-DD format to avoid timezone issues
    const dueDateStr = typeof t.due_date === 'string' 
      ? t.due_date.split('T')[0] 
      : new Date(t.due_date).toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    const matches = dueDateStr === todayStr;
    if (matches) {
      console.log("✅ [TaskBoard] Task matches today filter:", t.id, "due_date:", t.due_date, "parsed:", dueDateStr, "today:", todayStr);
    }
    return matches;
  };
  const isInDone = (t: Task) => t.is_completed;

  // Filter tasks for each column
  // If a task is being dragged to a column, show it there even if it doesn't match the filter yet
  const backlogTasks = allTasks.filter(t => {
    // Show dragged task in target column if that's where it's being dropped
    if (draggedTask && t.id === draggedTask.id && dropTarget === "backlog") return true;
    // Hide dragged task from other columns
    if (draggedTask && t.id === draggedTask.id && dropTarget !== "backlog") return false;
    return isInBacklog(t);
  });
  
  const todayTasks = allTasks.filter(t => {
    // Show dragged task in target column if that's where it's being dropped
    if (draggedTask && t.id === draggedTask.id && dropTarget === "today") {
      console.log("🎯 [TaskBoard] Showing dragged task in today column (during drag)");
      return true;
    }
    // Hide dragged task from other columns
    if (draggedTask && t.id === draggedTask.id && dropTarget !== "today") return false;
    // Check if task has optimistic update that puts it in today
    const optimisticUpdate = optimisticUpdates.get(t.id);
    if (optimisticUpdate && optimisticUpdate.due_date) {
      const optimisticDateStr = optimisticUpdate.due_date.toString().split('T')[0];
      const todayStr = new Date().toISOString().split('T')[0];
      const isNotCompleted = optimisticUpdate.is_completed === undefined || optimisticUpdate.is_completed === 0;
      if (optimisticDateStr === todayStr && isNotCompleted) {
        console.log("✅ [TaskBoard] Task has optimistic update for today:", t.id, "date:", optimisticDateStr);
        return true;
      }
    }
    // Use the optimistic task (t) which already has updates applied via getOptimisticTask
    const result = isInToday(t);
    if (result) {
      console.log("✅ [TaskBoard] Task matches today filter:", t.id, "due_date:", t.due_date);
    }
    return result;
  });
  
  const doneTasks = allTasks.filter(t => {
    // Show dragged task in target column if that's where it's being dropped
    if (draggedTask && t.id === draggedTask.id && dropTarget === "done") return true;
    // Hide dragged task from other columns
    if (draggedTask && t.id === draggedTask.id && dropTarget !== "done") return false;
    return isInDone(t);
  });

  // Clear optimistic updates when the real task data matches the expected state
  useEffect(() => {
    if (optimisticUpdates.size === 0) return;
    
    const checkOptimisticUpdates = () => {
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev);
        let changed = false;
        
        for (const [taskId, optimisticUpdate] of newMap.entries()) {
          const realTask = tasks.find(t => t.id === taskId);
          if (realTask) {
            // Check if the real task matches what we optimistically updated
            const dueDateMatches = optimisticUpdate.due_date === undefined || 
              (optimisticUpdate.due_date === null && (realTask.due_date === null || realTask.due_date === '')) ||
              (optimisticUpdate.due_date && realTask.due_date && 
               optimisticUpdate.due_date.toString().split('T')[0] === realTask.due_date.toString().split('T')[0]);
            const completedMatches = optimisticUpdate.is_completed === undefined || 
              realTask.is_completed === optimisticUpdate.is_completed;
            
            if (dueDateMatches && completedMatches) {
              // Real task matches optimistic update, check if it's in a column
              const inBacklog = !realTask.is_completed && (!realTask.due_date || realTask.due_date === '');
              const todayStr = new Date().toISOString().split('T')[0];
              const taskDateStr = realTask.due_date 
                ? (typeof realTask.due_date === 'string' 
                    ? realTask.due_date.split('T')[0] 
                    : new Date(realTask.due_date).toISOString().split('T')[0])
                : null;
              const inToday = !realTask.is_completed && taskDateStr === todayStr;
              const inDone = realTask.is_completed;
              
              // If task is in a column (matches our update), we can clear the optimistic update
              if (inBacklog || inToday || inDone) {
                console.log("🧹 [TaskBoard] Clearing optimistic update for task", taskId, "in column:", inBacklog ? "backlog" : inToday ? "today" : "done");
                newMap.delete(taskId);
                changed = true;
              }
            }
          }
        }
        
        return changed ? newMap : prev;
      });
    };
    
    // Check periodically
    const interval = setInterval(checkOptimisticUpdates, 200);
    return () => clearInterval(interval);
  }, [tasks, optimisticUpdates.size]);

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent, column: "backlog" | "today" | "done") => {
    e.preventDefault();
    // Set drop target to show dragged task in target column
    setDropTarget(column);
  };

  const handleDragLeave = () => {
    // Clear drop target when leaving a column
    setDropTarget(null);
  };

  const handleDrop = async (column: "backlog" | "today" | "done") => {
    if (!draggedTask) return;

    let updates: Partial<Task>;
    if (column === "backlog") {
      updates = { due_date: null, is_completed: 0 };
    } else if (column === "today") {
      // Use today's date in YYYY-MM-DD format
      const todayDate = new Date().toISOString().split("T")[0];
      console.log("📅 [TaskBoard] Setting due_date to today:", todayDate);
      updates = { 
        due_date: todayDate,
        is_completed: 0 
      };
    } else {
      updates = { is_completed: 1 };
    }

    console.log("🎯 [TaskBoard] Dropping task to column:", column, "Updates:", updates);

    // Apply optimistic update immediately so task appears in new column right away
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev);
      newMap.set(draggedTask.id, updates);
      return newMap;
    });

    const taskId = draggedTask.id;

    try {
      await onUpdate(taskId, updates);
      console.log("✅ [TaskBoard] Task update request sent successfully");
      
      // Don't clear optimistic update immediately - let the useEffect handle it
      // This ensures the task stays visible until the parent state updates
      
    } catch (error) {
      console.error("❌ [TaskBoard] Failed to update task:", error);
      // Revert optimistic update on error
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(taskId);
        return newMap;
      });
    } finally {
      setDraggedTask(null);
      setDropTarget(null);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Column
        title="Backlog"
        tasks={backlogTasks}
        onDragOver={(e) => handleDragOver(e, "backlog")}
        onDragLeave={handleDragLeave}
        onDrop={() => handleDrop("backlog")}
        onDragStart={handleDragStart}
        onDelete={onDelete}
        selectedTaskId={selectedTaskId}
        color="gray"
      />
      <Column
        title="Today"
        tasks={todayTasks}
        onDragOver={(e) => handleDragOver(e, "today")}
        onDragLeave={handleDragLeave}
        onDrop={() => handleDrop("today")}
        onDragStart={handleDragStart}
        onDelete={onDelete}
        selectedTaskId={selectedTaskId}
        color="red"
      />
      <Column
        title="Done"
        tasks={doneTasks}
        onDragOver={(e) => handleDragOver(e, "done")}
        onDragLeave={handleDragLeave}
        onDrop={() => handleDrop("done")}
        onDragStart={handleDragStart}
        onDelete={onDelete}
        selectedTaskId={selectedTaskId}
        color="green"
      />
    </div>
  );
}

function Column({ 
  title, 
  tasks, 
  onDragOver, 
  onDragLeave,
  onDrop, 
  onDragStart,
  onDelete,
  selectedTaskId,
  color 
}: {
  title: string;
  tasks: Task[];
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave?: () => void;
  onDrop: () => void;
  onDragStart: (task: Task) => void;
  onDelete: (id: number) => Promise<void>;
  selectedTaskId?: number;
  color: "gray" | "red" | "green";
}) {
  const colorClasses = {
    gray: "from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-800",
    red: "from-[#E50914]/10 to-[#FFD400]/5 dark:from-[#E50914]/20 dark:to-[#FFD400]/10",
    green: "from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-800/10",
  };

  return (
    <div
      className={`bg-gradient-to-b ${colorClasses[color]} border-2 border-gray-200 dark:border-gray-800 rounded-2xl p-4 min-h-[500px]`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold">{title}</h3>
        <span className="text-xs text-gray-600 dark:text-gray-400">{tasks.length}</span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            draggable
            onDragStart={() => onDragStart(task)}
            className={`bg-white dark:bg-gray-900 border-2 rounded-xl p-3 cursor-move transition-all hover:shadow-lg ${
              selectedTaskId === task.id 
                ? "border-[#E50914] shadow-lg shadow-[#E50914]/20" 
                : "border-gray-200 dark:border-gray-800"
            }`}
          >
            <div className="flex items-start gap-2 mb-2">
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    await taskStateManager.toggleTaskDone(task.id);
                  } catch (error) {
                    console.error("Failed to toggle task completion:", error);
                  }
                }}
                className="mt-0.5 text-gray-400 hover:text-[#E50914] transition-colors"
              >
                {task.is_completed ? (
                  <CheckCircle2 className="w-4 h-4 text-[#E50914]" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-xs mb-1 ${
                  task.is_completed ? "line-through text-gray-500" : ""
                }`}>
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {task.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-1">
                  {task.estimated_minutes && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                      <Clock className="w-2.5 h-2.5" />
                      {task.estimated_minutes}m
                    </span>
                  )}
                  {task.project && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-xs text-blue-700 dark:text-blue-300">
                      <FolderOpen className="w-2.5 h-2.5" />
                      {task.project}
                    </span>
                  )}
                  {task.tags && JSON.parse(task.tags).slice(0, 2).map((tag: string) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 rounded text-xs text-orange-700 dark:text-orange-300">
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onDelete(task.id)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
