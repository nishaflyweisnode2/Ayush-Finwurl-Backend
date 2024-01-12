const mongoose = require("mongoose");
mongoose.set("strictQuery", true)

const connectDB = async (url) => {
  mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then((data) => {
    console.log(`Ayush Finwurl Mongodb connected with server: ${data.connection.host}`);
});
}

module.exports = connectDB;
