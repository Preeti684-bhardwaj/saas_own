require("dotenv").config({path:"./.env"})

const env = {
  database: process.env.DATABASE,
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  dialect: process.env.DIALECT,
    // database: 'verceldb',
    // username: 'default',
    // password: '2koNB4jcZbpA',
    // host: 'ep-holy-butterfly-a4jqs854-pooler.us-east-1.aws.neon.tech',
    // dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
  port:5432
  };
  
  module.exports = env;
  