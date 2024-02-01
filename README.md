Back-end for https://github.com/tonidenevv/events-hub-frontend

Deployed version of the full-stack application: https://events-hub-frontend.vercel.app/

# Information
* Used Node.js, Express and MongoDB as main technologies, JWT and bcrypt for authentication, Multer and @google-cloud/storage for handling image uploads and uniqid to generate unique IDs for the images.
* Allows the client to make requests for registering an user, logging in, creating, editing and deleting an event, attending an event, commenting, liking comments, changing username, password, email and profile picture as well as deleting an account.
* Allows the client to also send images as a file, handle them accordingly, store them in a Google Cloud Storage, retrieve the URL of the image and save it in the database.
* Protected routes giving guests limited functionality, allowing users to view and attend events not owned by them but not being able to edit or delete them and allowing owners to edit and delete them without being able to attend them.

# Technologies
* Node: 18.18.2
* Express: 4.18.2
* Mongoose: 8.0.3
* Bcrypt": 5.1.1
* Cors: 2.8.5
* Dotenv": 16.3.1
* Jsonwebtoken": 9.0.2
* Nodemon: 3.0.2
* Uniqid: 5.4.0
* Multer: 1.4.5-lts.1
* @google-cloud/storage: 7.7.0
* date-fns: 3.3.1

# Setup
To run the server, you should run:
```
* Clone the repository
* Run npm install to install the dependencies
* Create your own .env file based on the .env.example file
* Run npm start to start the server
```

After that, you can start the client based on the instructions in the link in the beginning of the README.
