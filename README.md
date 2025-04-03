# Melaning A Blog API Application(Version 2)

A RESTful API for managing blogs, users, and authentication. This application allows administrators to create, update, and delete blog posts, while regular users can read posts and submit comments (pending admin approval).

## Features
- User authentication (admin and regular user roles)
- Blog post creation and management (only accessible by admins)
- Post creation, update, delete, and read functionality
- Admin can approve or reject comments submitted by users
- JWT-based authentication for secure access

## Tech Stack
- Node.js
- Express
- MongoDB (using Mongoose)
- Chai & Mocha (for testing)
- JSON Web Tokens (JWT) for authentication

## Installation

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/en/)
- [MongoDB](https://www.mongodb.com/)
- [Postman](https://www.postman.com/) or similar API testing tool (optional)

### Steps to Set Up

1. Clone the repository:
   git clone https://github.com/MobuchiElly/melanin-a-backend.git

2. Navigate to the project directory:
   cd melanin-a-backend


3. Install dependencies:
   npm install

4. Set up environment variables:
   - Create a `.env` file in the root of the project.
   - Add the following environment variables:
     JWT_SECRET=your-secret-key
     JWT_LIFETIME=your-jwt-lifetime
     MONGO_URI=your-monogdb-connection-string
     AUTHEMAIL=your-admin-email
     AUTHPASSW=your-admin-password
     USEREMAIL=regular-user-email
     USERPASSW=regular-user-password

5. Start the server:
   npm start

   This will start the application on [http://localhost:5000](http://localhost:5000).

### Running Tests
1. To run tests, use the following command:
   npm test

   This will run all the test cases using Mocha and Chai.

## Endpoints

### Auth Routes

- **POST `/api/v1/auth/login`**
  - Logs in a user and returns a JWT token.
  - Request Body:
    {
      "email": "your-email",
      "password": "your-password"
    }

  - Example Response:
    {
      "user": {
        "name":"example name",
        "uid":"your user id",
      },
      "token": "JWT_TOKEN"
    }

### Blog Routes

- **POST `/api/v1/blogs`**
  - Creates a new blog post (only accessible to admins).
  - Authorization: Bearer Token required.
  - Example Request Body:
    {
      "title": "Blog Title",
      "content": "Blog Content",
      "tags": "tag1, tag2",
      "image": "image-url"
    }

  - Example Response:
    {
      "_id": "new-post-id",
      "title": "Blog Title",
      "content": "Blog Content",
      "tags": "tag1, tag2",
      "image": "image-url",
      "createdAt": "timestamp",
      "updatedAt": "timestamp",
      "comments": [],
      "likes": []
    }

### Admin Routes

- **GET `/api/v1/comments?aprroved=true`**
  - Fetches a list of all approved comments (only accessible to admins).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- Author: Eleazer Mobuchu Ugwu
- Email: buchidevv@gmail.com
- GitHub: [MobuchiElly](https://github.com/MobuchiElly)