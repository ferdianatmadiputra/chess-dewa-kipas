let env = process.env.NODE_ENV || "development";

if (env === "development" || env === "test") {
  require("dotenv").config();
}

module.exports = {
  development: {
    username: process.env.DEV_USER_DB,
    password: process.env.DEV_PASS_DB,
    database: "dewa-kipas-db",
    host: "localhost",
    dialect: "postgres",
  },
  test: {
    username: process.env.DEV_USER_DB,
    password: process.env.DEV_PASS_DB,
    database: "dewa-kipas-db-test",
    host: "localhost",
    dialect: "postgres",
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // <<<<<<< YOU NEED THIS TO FIX UNHANDLED REJECTION
      },
    },
  },
};
