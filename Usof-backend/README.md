# Backend Application

This is a backend application for the USOF application. To check the functionality of the backend, please follow these instructions.

## Getting Started

### 1. Install Required Libraries
To get started, you need to download the required libraries and dependencies. Run the following command in the terminal to install all necessary packages:

```bash
npm install
```

This will install all the dependencies listed in the `package.json` file.

### 2. Set SMTP Configuration in config.js
To send password change emails, you need to configure the SMTP settings. Please follow these steps:

1. Open the `config.js` file in your project.
2. Set the following environment variables:

   - `SMTP_USER`: This should be your Gmail address, the email from which password change letters will be sent.
   - `SMTP_PASS`: This should be your Gmail application password, which can be generated from the Gmail security settings. Do not use your Gmail login password. To generate an application password, follow these steps:
     1. Go to your Google Account Security settings.
     2. Under "App passwords," generate a new password for the application that you will use for sending emails.

Example:

```js
SMTP_USER: 'your-email@gmail.com',
SMTP_PASS: 'your-application-password'
```

### 3. Set Up a Database Management System
To interact with and view the data in your database, you will need a database management tool.

**Recommended Tools:**
- pgAdmin

Make sure your database is running, and use one of these tools to manage and query the database. You should be able to check the results of your backend requests directly in the database.

### 4. Run the Server
You should run the server via the following command:

```bash
npm start
```

### 5. Test the Backend
Despite the need to create an admin panel for this task, it was decided to leave that feature to the frontend part of the app since it makes more sense.

To test the functionality of the backend, I recommend using Postman, a popular tool for testing APIs.

Steps:
1. Download and install Postman.
2. There will be several requests with given information and instructions for testing endpoints.
3. Open Postman and create requests to test the following:

---

## AUTH

### POST /api/auth/register
For registration (should contain a body).

#### Example body:
```json
{
    "login": "user1",
    "password": "Password123",
    "email": "user1@gmail.com",
    "fullName": "User One"
}
```

### POST /api/auth/login
For authorization (should contain a body).

#### Example body:
```json
{
    "login": "user1",
    "password": "Password123"
}
```

### POST /api/auth/logout
For logging out (should contain a token of a logged-in user).

### POST /api/auth/change-password
For changing password (should contain a token of an authorized user and a body).

#### Example body:
```json
{
    "currentPassword": "Password1234",
    "newPassword": "Password12345"
}
```

---

## USERS

### POST /api/users/
For adding a user with a role (should contain a token of an admin and a body).

#### Example body:
```json
{
    "login": "userNew",
    "fullName": "User New",
    "email": "userNew@gmail.com",
    "password": "Password1234",
    "role": "user"
}
```

### PUT /api/users/1
For changing user data (should contain a token of an admin and a body).

#### Example body:
```json
{
    "login": "userUpd",
    "fullName": "User Upd",
    "email": "userUpd@gmail.com",
    "role": "admin"
}
```

### GET /api/users/
For getting all users (should contain a token of an admin).

### DELETE /api/users/1
For deleting a user (should contain a token of an admin).

---

## CATEGORIES

### POST /api/categories/
For creating a category (should contain a token of an admin and a body).

#### Example body:
```json
{
    "title": "New Category",
    "description": "Very interesting category!"
}
```

### PUT /api/categories/1
For changing a category (should contain a token of an admin and a body).

#### Example body:
```json
{
    "title": "Updated Category",
    "description": "Very boring category!"
}
```

### GET /api/categories/
For getting all categories (should contain a token of an admin).

### DELETE /api/categories/1
For deleting a category (should contain a token of an admin).

---

## POSTS

### POST /api/posts/createPost
For creating a post (should contain a token of an authorized user and a body).

#### Example body:
```json
{
    "title": "testTitle",
    "content": "testContent",
    "image": "imageMock",
    "categoryIds": [1, 2]
}
```

### PUT /api/posts/3
For changing posts/posts status (should contain a body and a token of an owner of a post for changing main fields or a token of an admin for additionally changing status).

#### Example body:
```json
{
    "content": "Content changed",
    "image": "test.jpg",
    "categoryIds": [1],
    "status": "inactive"
}
```

### GET /api/posts/
For getting posts with defined filters (should contain params for filtering).

#### Example params:
- **Filtering:**
  - `categoryIds`: 1, 2
  - `startDate`: 2024-11-10
  - `endDate`: 2024-11-15
- **Sorting:**
  - `sortBy`: date
  - `order`: ASC
- **Pagination:**
  - `page`: 1
  - `pageSize`: 2

### DELETE /api/posts/1
For deleting a post (should contain a token of an owner of a post or admin).

---

## FAVORITES

### POST /api/favorites/add
For adding a post to favorites (should contain a token of an authorized user and a body).

#### Example body:
```json
{
    "postId": 1
}
```

### GET /api/favorites/4
For getting favorite posts for a given user (should contain a token of an authorized user).

### GET /api/favorites/
For getting all categories (should contain a token of an admin).

### DELETE /api/favorites/1
For deleting posts from favorites (should contain a token of a user who has this post in favorites).

---

## COMMENTS

### POST /api/comments/1
For creating a comment for a given post (should contain a token of an authorized user and a body).

#### Example body:
```json
{
    "content": "Wow!"
}
```

### PUT /api/comments/5
For changing a comment with the given ID (should contain a token of an owner of a comment and a body).

#### Example body:
```json
{
    "content": "Wow Updated!"
}
```

### GET /api/comments/1
For getting all comments with the given postId.

### GET /api/comments/
For getting all comments (should contain a token of an admin).

### DELETE /api/comments/6
For deleting a comment with the given ID (should contain a token of an admin or owner of a comment).

---

## LIKES

### POST /api/likes/
For creating a like/dislike under a comment/post (should contain a token of an authorized user and a body).

#### Example body:
```json
{
    "postId": 3,
    "isLike": true
}
```

#### Example body for a comment:
```json
{
    "commentId": 3,
    "isLike": false
}
```

### GET /api/likes/?postId=1
For getting all likes/dislikes for a post with the given ID.

### GET /api/likes/?commentId=1
For getting all likes/dislikes for a comment with the given ID.

### DELETE /api/likes/5
For deleting a like with the given ID (should contain a token of an owner of a like).
