import { useState, useEffect } from "react";
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
import { toast } from "sonner";

// Type definitions to match your Prisma schema
interface Task {
  id: string;
  title: string;
  description: string;
  status: "Pending" | "Completed" | "inProgress";
  priority: "Low" | "Medium" | "High";
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

export const UserCard = ({ user }: { user: User }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Medium" as "Low" | "Medium" | "High",
    dueDate: "",
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("You must be logged in to view tasks");
          return;
        }
        const response = await axios.get(
          `http://localhost:3000/api/task/get-tasks/${user.id}`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        if (response.status === 200) {
          setTasks(response.data.tasks || response.data);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };
    if (isDrawerOpen) {
      fetchTasks();
    }
  }, [isDrawerOpen, user.id]);

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        dueDate: newTask.dueDate,
        status: "Pending" as const,
        userId: user.id,
      };

      const response = await axios.post(
        `http://localhost:3000/api/task/add-task/${user.id}`,
        taskData,
        {
          headers: {
            Authorization: `${token}`, // Fixed: Added "Bearer" prefix and moved to correct place
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Task added successfully");
        // Add the new task to local state
        const newTaskData = response.data.task || response.data;
        setTasks([...tasks, newTaskData]);

        // Reset form
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
      toast.error("Failed to add task");
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = currentStatus === "Completed" ? "Pending" : "Completed";

      const response = await axios.patch(
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
        // Update local state
        setTasks(
          tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: newStatus as "Pending" | "Completed" | "inProgress",
                }
              : task
          )
        );
        toast.success("Task status updated");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status");
    }
  };

  const getStatusIcon = (status: string) => {
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

  const getPriorityColor = (priority: string) => {
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
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
          </button>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
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
                onClick={() => setIsAddTaskOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </div>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <div className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </div>
                <textarea
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </div>
                  <select
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        priority: e.target.value as "Low" | "Medium" | "High",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </div>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) =>
                      setNewTask({ ...newTask, dueDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddTask}
                  className="flex-1 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors font-medium"
                >
                  Add Task
                </button>
                <button
                  onClick={() => setIsAddTaskOpen(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition-colors"
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
          onClick={() => setIsDrawerOpen(false)}
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
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
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
                {tasks.map((task) => (
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
