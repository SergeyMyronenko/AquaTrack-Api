import express from "express";
import cors from "cors";
import userRouter from "./routes/userRoute.js";
import waterRouter from "./routes/waterRoute.js";
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from "./swagger.json" with { type: "json" };

export const app = express();

app.use(cors());
app.use(express.json());


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/users", userRouter);
app.use("/api/water", waterRouter);

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});
