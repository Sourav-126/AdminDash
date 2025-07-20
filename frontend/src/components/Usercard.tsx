import { useState, useEffect } from "react";
import type { ChangeEvent, MouseEvent, JSX } from "react";
import {
  Plus,
  List,
  X,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import type { AxiosResponse } from "axios";
import { toast } from "sonner";

type TaskStatus = "Pending" | "Completed" | "inProgress";
type TaskPriority = "Low" | "Medium" | "High";

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  userId: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface NewTaskForm {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
}

interface TaskResponse {
  tasks?: Task[];
  task?: Task;

  [key: string]: Task[] | Task | string | undefined;
}

interface ApiError extends Error {
  response?: {
    status: number;
    data: {
      message?: string;
      error?: string;
    };
  };
}

interface UserCardProps {
  user: User;
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [newTask, setNewTask] = useState<NewTaskForm>({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
  });

  useEffect(() => {
    const fetchTasks = async (): Promise<void> => {
      try {
        setLoading(true);
        const token: string | null = localStorage.getItem("token");
        if (!token) {
          toast.error("You must be logged in to view tasks");
          return;
        }

        const response: AxiosResponse<TaskResponse> = await axios.get(
          `http://localhost:3000/api/task/get-tasks/${user.id}`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        if (response.status === 200) {
          if (Array.isArray(response.data)) {
            setTasks(response.data);
          } else if (Array.isArray(response.data.tasks)) {
            setTasks(response.data.tasks);
          } else {
            toast.error("Unexpected response format");
          }
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        const apiError = error as ApiError;
        const errorMessage: string =
          apiError.response?.data?.message || "Failed to fetch tasks";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (isDrawerOpen) {
      fetchTasks();
    }
  }, [isDrawerOpen, user.id]);

  const handleAddTask = async (): Promise<void> => {
    if (!newTask.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    try {
      const token: string | null = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to add tasks");
        return;
      }

      const taskData: Omit<Task, "id" | "createdAt"> = {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        dueDate: newTask.dueDate,
        status: "Pending" as const,
        userId: user.id,
      };

      const response: AxiosResponse<TaskResponse> = await axios.post(
        `http://localhost:3000/api/task/add-task/${user.id}`,
        taskData,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Task added successfully");

        if (Array.isArray(response.data)) {
          setTasks(response.data);
        } else if (Array.isArray(response.data.tasks)) {
          setTasks(response.data.tasks);
        } else {
          toast.error("Unexpected response format");
        }

        setNewTask({
          title: "",
          description: "",
          priority: "Medium",
          dueDate: "",
        });
        setIsAddTaskOpen(false);
      }
    } catch (error) {
      console.error("Error adding task:", error);
      const apiError = error as ApiError;
      const errorMessage: string =
        apiError.response?.data?.message || "Failed to add task";
      toast.error(errorMessage);
    }
  };

  const toggleTaskStatus = async (
    taskId: string,
    currentStatus: TaskStatus
  ): Promise<void> => {
    try {
      const token: string | null = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to update tasks");
        return;
      }

      const newStatus: TaskStatus =
        currentStatus === "Completed" ? "Pending" : "Completed";

      const response: AxiosResponse = await axios.patch(
        `http://localhost:3000/api/task/update-status/${taskId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setTasks((prevTasks: Task[]) =>
          prevTasks.map((task: Task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: newStatus,
                }
              : task
          )
        );
        toast.success("Task status updated");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      const apiError = error as ApiError;
      const errorMessage: string =
        apiError.response?.data?.message || "Failed to update task status";
      toast.error(errorMessage);
    }
  };

  const getStatusIcon = (status: TaskStatus): JSX.Element => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "inProgress":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "Pending":
      default:
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
    }
  };

  const getPriorityColor = (priority: TaskPriority): string => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
      default:
        return "bg-green-100 text-green-800";
    }
  };

  const handleInputChange =
    (field: keyof NewTaskForm) =>
    (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ): void => {
      setNewTask((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleModalClose = (): void => {
    setIsAddTaskOpen(false);
    setNewTask({
      title: "",
      description: "",
      priority: "Medium",
      dueDate: "",
    });
  };

  const handleDrawerToggle = (open: boolean) => (): void => {
    setIsDrawerOpen(open);
  };

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      setIsDrawerOpen(false);
    }
  };

  return (
    <>
      <section className="flex flex-col p-4 sm:p-6 lg:p-8 gap-4 border-b border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out">
        <div className="flex p-3 bg-gray-500/10 gap-3 rounded-md hover:bg-gray-500/20 transition-all duration-300 ease-in-out">
          <div className="space-y-1 flex-1 min-w-0">
            <h2 className="font-bold text-sm sm:text-base lg:text-lg text-gray-900 hover:text-blue-600 transition-colors duration-200 truncate">
              {user.name}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 truncate">
              {user.email}
            </p>
            <p className="text-xs text-gray-400 hover:text-gray-600 transition-colors duration-200 font-mono">
              {user.id}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => setIsAddTaskOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            type="button"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
          </button>

          <button
            onClick={handleDrawerToggle(true)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            type="button"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">View Tasks</span>
            <span className="bg-white text-gray-600 text-xs px-1.5 py-0.5 rounded-full ml-1">
              {tasks.length}
            </span>
          </button>
        </div>
      </section>

      {/* Add Task Modal */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 bg-gray-300/95 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Add New Task
              </h3>
              <button
                onClick={handleModalClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={handleInputChange("title")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={handleInputChange("description")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={handleInputChange("priority")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={handleInputChange("dueDate")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddTask}
                  className="flex-1 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors font-medium"
                  type="button"
                >
                  Add Task
                </button>
                <button
                  onClick={handleModalClose}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition-colors"
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Drawer */}
      <div
        className={`fixed inset-0 z-50 ${
          isDrawerOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 ${
            isDrawerOpen ? "opacity-50" : "opacity-0"
          }`}
          onClick={handleBackdropClick}
        />

        <div
          className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Tasks for {user.name}
              </h2>
              <p className="text-sm text-gray-500">
                {tasks.length} tasks total
              </p>
            </div>
            <button
              onClick={handleDrawerToggle(false)}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8">
                <List className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No tasks found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task: Task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                      task.status === "Completed"
                        ? "bg-green-50 border-green-200"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <h3
                          className={`font-medium ${
                            task.status === "Completed"
                              ? "text-green-900 line-through"
                              : "text-gray-900"
                          }`}
                        >
                          {task.title}
                        </h3>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Due: {task.dueDate || "No due date"}</span>
                      </div>
                      <button
                        onClick={() => toggleTaskStatus(task.id, task.status)}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
                        type="button"
                      >
                        {task.status === "Completed" ? "Reopen" : "Complete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
