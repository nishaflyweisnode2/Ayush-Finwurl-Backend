const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require("mongoose");
require("dotenv").config()
const app = express();
const compression = require("compression");
const serverless = require("serverless-http");
const connectDB = require("./db/connect")
const port = process.env.PORT
const connString = process.env.MONGO_DB_URI

// Configure your routes and middleware here
app.use(compression({ threshold: 200 }));
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({
  origin: "*"
}));

app.get("/", (req, res) => {
  res.send("Hello Finwurl!");
});

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      scriptSrc: ["'self'", "'https://apis.google.com'"],
      // Add other directives as needed
    },
  })
);

//Importing Routers
const authRouter = require("./routes/auth")
const prefrRouter = require("./routes/prefr")
const stashfinRouter = require("./routes/stashfin")
const webhookRouter = require("./routes/webhook")
const userRouter = require("./routes/user")
const leadsRouter = require("./routes/leads")
const userRoutes = require("./routes/appRoute/userRoute")
const adminRoutes = require("./routes/appRoute/adminRoute")

// Routes
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/prefr", prefrRouter)
app.use("/api/v1/stashfin", stashfinRouter)
app.use("/api", webhookRouter)
app.use("/api/v1/user", userRouter)
app.use("/api/v1/leads", leadsRouter)
app.use("/api/v1/appUser", userRoutes)
app.use("/api/v1/admin", adminRoutes)




// Start the HTTP server
app.listen(port, async () => {
  await connectDB(connString)
  console.log(`Server running at: http://localhost:${process.env.PORT}/`);
});

module.exports = { handler: serverless(app) };