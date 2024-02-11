const express = require("express");
require("dotenv").config();
const PORT = process.env.PORT || 8000;
require("colors");
const cors = require("cors");
const { errorHandler } = require("./middleware/errorMiddleware");
const connectDb = require("./config/db");
// Connect to databse
connectDb();

const app = express();

const allowedOrigins = [
  "https://xero-frontend.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/xero", require("./routes/xeroRoutes"));
app.use("/api/company", require("./routes/companyRoutes"));
app.use("/api/upload", require("./routes/uploadRoute"));

app.get("/", (_, res) => {
  res.status(200).json({ message: "Welcome to the Xero Backend API" });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Connected to port:${PORT}`.blue);
});
