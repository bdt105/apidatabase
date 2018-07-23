# Connexion #
This package gives functions to authentification capabilities based on JWT and MySql

## Dependencies ##
- bcryptjs
- bdt105toolbox
- jsonwebtoken
- mysql

## How does it work? ##
The principle is to check once against a database table with login and password. If success then a JWT is created and can be check any time without having to request the database anymore.

## How to install? ##
~~~
npm install --save bdt105connexion
~~~

Create a table containing at least two fields: login and password (the name of the fields can be customized)

Example
~~~
CREATE TABLE `database`.`user` (
  `iduser` INT NOT NULL,
  `login` VARCHAR(200) NOT NULL,
  `password` VARCHAR(200) NOT NULL,
  PRIMARY KEY (`iduser`));
~~~

## How to use? ##
Create an object Connexion 
~~~
import { Connexion, MySqlConfiguration, JwtConfiguration } from './connexion';

let mySqlConfiguration = new MySqlConfiguration(
    "localhost", 3306, 
    "root", "root", "connexion", 
    "user", "login", "password"); // Optional - defines host, port, user, password and database to connect to MySql
let jwtConfiguration = new JwtConfiguration("secretbdt105", "$2a$10$abcdefabcdefabcdefabcd", 
    "userRequestEmail@mail.com", "adminToken"); // Optional - defines JWT parameters

var c = new Connexion(mySqlConfiguration, jwtConfiguration);

// Add a new user
var callbackCreateUser = (err: any, data: any) =>{
    console.log("User creation result", data);
    console.log("User creation error", err);
}

var encrypt = c.encrypt("adm");

c.querySql((err: any, data: any) => callbackCreateUser(err, data), "insert into user (login, password, application) values ('admin', '" + encrypt +"', 'test')");

// get token from a user
var callbackGetUserToken = (err: any, data: any) =>{
    console.log("User check result", data);
    console.log("User check error", err);
    var newUserId = data.insertId;

    // Checks if user is valid
    var token = data;
    var decoded = c.checkJwt(token);
    console.log(decoded);
}

c.getJwt((err: any, data: any) => callbackGetUserToken(err, data), "admin", "adm");
~~~

MySqlConfiguration set all parameters to access the database and perfom the login/password verification.
~~~
class MySqlConfiguration {
    public host: string;
    public user: string;
    public password: string;
    public port: number;
    public database: string;

    public userTableName: string; // Table where users are stored
    public loginFieldName: string; // Name of the login field
    public passwordFieldName: string; // Name of the password field
}
~~~

JwtConfiguration set all parameters for JWT manipulations.
~~~
class JwtConfiguration {
    public secret: string;
    public salt: string; // Your hash "salt" parameter is used to encrypt passwords, it must start with '$2a$10$' (salt version compatible), total salt length must be >= 29.
    public userRequestEmail: string;
    public adminToken: string; // Define "adminToken" to have a default token for singup actions (adding a user without authentification).
}
~~~

If "jwtConfiguration" parameter is not set then no JWT functions are usable.
If "mySqlConfiguration" parameter is not set then no MySql functions are usable. If user table name, login field name or password field name are ommited, then no authentification is possible (MySql queries remain possible).
To generate an encrypted password you may use function encrypt().

## Functions ##

### querySql(callback: Function, sql: string) ###
Executes a sql query and calls callback function. Callback function will be like callback(err: any, rows: any).
~~~
import { Connexion } from "bdt105connexion/dist";

let configuration = new Configuration("user", "login", "password"); // defines table name, login field name, password field name
let mySqlConfiguration = new MySqlConfiguration("localhost", 3306, "admin", "admin_password", "password"); // defines host, port, user, password and database to connect to MySql
let jwtConfiguration = new JwtConfiguration("secret", "salt", "userRequestEmail@mail.com", "adminToken"); // defines JWT parameters

let conn = new Connexion(mySqlConfiguration, jwtConfiguration, configuration);

let callback = function (err: any, rows: any){
    if (err){
        console.log("Oups error");
    }else{
        console.log("Everything is fine");
    }
}

conn.querySql(callback, "select * from order, customers where order.customerId = customer.customerId");
~~~

### getJwt(callback: Function, login: string, plainPassword: string, where: string = null) ###
Gets Json Web Token according to login and password. Add a specific where to the query if needed. Callback function will be like callback(err: any, jwt: any).

### checkJwt(token: string): Token ###
Returns a Token object {"token":token, "status": "OK|ERR", "decoded": decoded}. The token is valid if status="OK" and/or decode is not null.

### isTokenValid(token: string) : boolean ###
Is the token valid?

### encrypt(plain: string) ###
Encrypts a string according to "salt" parameter.

### compareEncrypt(encrypted: string, plain: string): boolean ###
Compares two encrypted strings. If true then strings are equal