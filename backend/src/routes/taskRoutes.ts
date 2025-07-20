import express from "express";
import { middleware } from "../middleware/middleware";
import { prisma } from "../lib/prisma";

export const taskRouter = express();

taskRouter.post("/add-task/:id", middleware, async (req, res) => {
  try {
    const body = req.body;
    const { title, description, dueDate, priority, status } = body;
    const userId = req.params.id;

    // Validation
    if (!title || !description) {
      return res.status(400).json({
        error: "Title and description are required",
      });
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const newTask = await prisma.task.create({
      data: {
        userId,
        title,
        description,
        dueDate: dueDate || "",
        status: status || "Pending",
        priority: priority || "Medium",
      },
    });

    res.status(201).json({
      message: "Task created successfully",
      task: newTask,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({
      error: "Failed to create task",
    });
  }
});

taskRouter.get("/get-tasks/:id", middleware, async (req, res) => {
  const { id: userId } = req.params;

  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks for userId:", userId, error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

taskRouter.patch("/update-status/:taskId", middleware, async (req, res) => {
  const { taskId } = req.params;

  const updatedStatus = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      status: "Completed",
    },
  });

  res.json({
    message: "Done and Dusted!",
  });
});
