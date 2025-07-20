import express from "express";
import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";
import { middleware } from "../middleware/middleware";
export const adminRouter = express();

adminRouter.post("/create-user", async (req, res) => {
  const body = req.body;

  const { name, email } = body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user) {
      return res.json({
        message: "User already exists with this email",
      });
    }

    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
      },
    });
    res.json(newUser.id);
  } catch (error) {
    console.log("error happens", error);
    res.json({
      message: "Error making the User",
    });
  }
});
adminRouter.post("/signup", async (req, res) => {
  const body = await req.body;

  const { name, email, password } = body;

  try {
    const admin = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (admin) {
      return res.json({
        message: "Admin already exists with this email",
      });
    }

    const newAdmin = await prisma.admin.create({
      data: {
        name: name,
        email: email,
        password: password,
      },
    });
    const adminId = newAdmin.id;
    const token = jwt.sign({ id: adminId }, process.env.JWT_SECRET!);

    res.json({
      token,
    });
  } catch (error) {
    console.log("error happens while creating the admin", error);
  }
});

adminRouter.post("/signin", async (req, res) => {
  const body = await req.body;

  const { email } = body;

  try {
    const admin = await prisma.admin.findUnique({
      where: {
        email: email,
      },
    });

    if (!admin) {
      return res.json({
        message: "No admin with this email",
      });
    }

    const adminId = admin.id;
    const token = jwt.sign({ id: adminId }, process.env.JWT_SECRET!);

    res.json({
      token,
    });
  } catch (error) {
    console.log("Error happens while Logging In", error);
  }
});

adminRouter.get("/users", middleware, async (req, res) => {
  const users = await prisma.user.findMany({
    where: {
      
    },
  });
  res.json(users);
});
