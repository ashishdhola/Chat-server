import dotenv from "dotenv";
import express, { urlencoded } from "express";

import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();
app.use(express.urlencoded());

app.use(express.json());
app.use(cookieParser());
// app.use(
//   cors({
//     origin: "https://chat-react-rho-flax.vercel.app/",
//     credentials: true,
//   })
// );

const allowedOrigins = [
  "https://chat-react-ashish-dholas-projects.vercel.app",
  "https://chat-react-rho-flax.vercel.app"
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT,() => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});
