import express from "express";
import { v1Router } from "./routes/v1-routes.js";
import connectDB from "./db.js";
import cors from "cors";
import "dotenv/config";
import cron from "node-cron";
import { Member } from "./models/MemberModel.js";

// * Test the connection to MongoDB
connectDB();

const app = express();

// * Morgan is used for logging the requests
// app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const ClientURL = process.env.ClientURL;
const ClientURL2 = process.env.ClientURL2;
const ClientURL3 = process.env.ClientURL3;
const ClientURL4 = process.env.ClientURL4;

// * Define the URLs for CORS
const corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (!origin || process.env.NODE_ENV === "development") {
      callback(null, true);
    } else {
      const allowedOrigins = [ClientURL, ClientURL2, ClientURL3, ClientURL4];

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Origin not allowed by CORS"));
      }
    }
  },
};

app.use(cors(corsOptions));

// * Middleware to set the Cache-Control header
app.use(function (req, res, next) {
  res.set("Cache-Control", "no-cache, private, no-store, must-revalidate");
  next();
});

// * Middleware to forward the request to the v1Router
app.use("/api/v1", v1Router);

// * Define the port for the server
const PORT = process.env.PORT || 8080;

// Cron job to run every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running daily job to update member status...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update members whose expiryDate is before today
    const result = await Member.updateMany(
      { expiryDate: { $lt: today }, isActive: true },
      { $set: { isActive: false } }
    );

    console.log(`Updated ${result.modifiedCount} members to inactive.`);
  } catch (error) {
    console.error("Error running the daily job:", error);
  }
});

// * Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
