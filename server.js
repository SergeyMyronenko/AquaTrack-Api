import { connect } from "mongoose";
import { app } from "./app.js";
import "dotenv/config";

const { DB_HOST, PORT } = process.env;

const startServer = async () => {
  try {
    await connect(DB_HOST);
    app.listen(PORT, () => {
      console.log(`server use port${PORT}`);

      console.log("DATABASE connect succsesfully");
    });
  } catch (error) {
    console.error(error);
  }
};

startServer();
