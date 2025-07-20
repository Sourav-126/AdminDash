import express from "express";
import cors from "cors";
import { adminRouter } from "./routes/adminRoutes";
import { taskRouter } from "./routes/taskRoutes";

const app = express();

app.use(express.json());

app.use(cors());

app.use("/api/admin", adminRouter);
app.use("/api/task", taskRouter);

app.listen("3000", () => {
  console.log("Server Listening at 3000");
});
