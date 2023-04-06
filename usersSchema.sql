DROP TABLE IF EXISTS Users;

CREATE TABLE IF NOT EXISTS Users (
    userId SERIAL,
    userFullName VARCHAR(255) NOT NULL,
    dateOfBirth DATE,
    email VARCHAR(255) CONSTRAINT Uniqe_email UNIQUE NOT NULL,
    imageURL TEXT DEFAULT 'https://img.freepik.com/premium-vector/anonymous-user-circle-icon-vector-illustration-flat-style-with-long-shadow_520826-1931.jpg' ,
    bio TEXT,
    PRIMARY KEY(userId)
);