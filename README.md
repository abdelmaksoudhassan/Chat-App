# Chat APP
real time chat app developed using express, mongoDB and Handlebars

# used packages
1-bcryptjs: to secure password,
2-body-parser: to access data from HTTP requests and process form submissions,
3-express-session && connect-mongodb-session: to store users sessions,
4-express: for request and middleware handling,
5-jsonwebtoken: for authentication and authorization,
6-hbs: Handlebars views,
7-mongoose: to access database,
8-socket.io: to make real time application,
9-validator: to validate form imput fields,

# Features
1- Authentication: signup, login and auth guards
2- Create or delete rooms
3- After room creation any one can join by room code and room password
4- All room messages stores in database
5- Once user joined room he can send, get messages and leave this room
6- online list will be updated automatically when any user logged in or logged out

# npm install
# npx nodemon server.js