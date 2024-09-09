const { FORCE } = require("sequelize/lib/index-hints");
const app = require("./app.js")
const db = require("./db/dbConnection.js")
require("dotenv").config({path:"./.env"})
const passport = require('passport');
const passportJWT = require('passport-jwt');

process.on("uncaughtException" , (err)=>{
    console.log(`Error: ${err.message}`)
    console.log(`Shutting down the server due to uncaught Exception`)
    process.exit(1)
})
// jwt verification 
let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = process.env.JWT_SECRET;
jwtOptions.passReqToCallback = true;

let strategy = new JwtStrategy(jwtOptions, function (req, jwt_payload, done) {
  var Model = jwt_payload.obj.type === 'CUSTOMER' ? db.customers : db.admins;
  
  Model.findOne({ where: { id: jwt_payload.obj.obj.id } })
    .then(user => {
      if (user) {
        let obj = {
          type: jwt_payload.obj.type,
          obj: user
        };
        return done(null, obj);
      } else {
        return done(null, false);
      }
    })
    .catch(error => {
      return done(null, false);
    });
});

passport.use('jwt', strategy);
  
// connectDB()
// database connection
db.sequelize.sync()
.then(() => {
    const server = app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })

    process.on("unhandledRejection" , (err)=>{
        console.log(`Error: ${err.message}`)
        console.log(`Shutting down the server due to Unhandled Promise Rejection`);
    
        server.close(()=>{
            process.exit(1)
        })
    })
})
.catch((err) => {
    console.log("db connection failed !!! ", err);
    process.exit(1)
})