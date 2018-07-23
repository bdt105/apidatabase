"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connexion_1 = require("./connexion");
let mySqlConfiguration = new connexion_1.MySqlConfiguration("localhost", 3306, "root", "root", "connexion", "user", "login", "password"); // Optional - defines host, port, user, password and database to connect to MySql
let jwtConfiguration = new connexion_1.JwtConfiguration("secretbdt105", "$2a$10$abcdefabcdefabcdefabcd", "userRequestEmail@mail.com", "adminToken"); // Optional - defines JWT parameters
var c = new connexion_1.Connexion(mySqlConfiguration, jwtConfiguration);
// Add a new user
var callbackCreateUser = (err, data) => {
    console.log("User creation result", data);
    console.log("User creation error", err);
};
var encrypt = c.encrypt("adm");
c.querySql((err, data) => callbackCreateUser(err, data), "insert into user (login, password, application) values ('admin', '" + encrypt + "', 'test')");
// get token from a user
var callbackGetUserToken = (err, data) => {
    console.log("User check result", data);
    console.log("User check error", err);
    var newUserId = data.insertId;
    // Checks if user is valid
    var token = data;
    var decoded = c.checkJwt(token);
    console.log(decoded);
};
c.getJwt((err, data) => callbackGetUserToken(err, data), "admin", "adm");
//# sourceMappingURL=test.js.map