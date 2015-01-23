# ChatExample
Simple node.js+socket.io chat with rooms, no anonimous users, registration without email confirmation.

Users can create, delete, edit (room password, description and name) their rooms.

Users cen change their names and passwords.

Two types of rooms: public and password protected.

To create public room leave password field blank during room creation.

Implemented message history (get all message and get 100 messages buttons).

Upon entering password protected room user vill be asked to enter room password, if password wrong => room will not initialize.

Used:

socket.io: 1.3.2 https://github.com/Automattic/socket.io

express: 4.11.0 https://github.com/strongloop/express

bcrypt:  0.8.1 https://github.com/ncb000gt/node.bcrypt.js (passwords hashing and salting)

connect-flash: 0.1.1 https://github.com/jaredhanson/connect-flash (small messages to user)

passport: 0.2.1 https://github.com/jaredhanson/passport (authorisation)

passport-local: 1.0.0 https://github.com/jaredhanson/passport-local

passport.socketio: 3.4.1 https://github.com/jfromaniello/passport.socketio (passport integration to socket.io)

redis: 0.12.1 https://github.com/mranney/node_redis (redis nodejs api)

hiredis: 0.1.17 https://github.com/redis/hiredis (minimalistic C client library for the Redis database)

swig: 1.4.2 https://github.com/swig/swig (template generation engine)
