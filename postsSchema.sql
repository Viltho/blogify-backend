DROP TABLE IF EXISTS Posts;

CREATE TABLE IF NOT EXISTS Posts(
    postId SERIAL ,
    userId SERIAL NOT NULL,
    imageURL TEXT ,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    numberOfLikes int NOT NULL DEFAULT 0,
    Created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(postId),
    CONSTRAINT fk_user FOREIGN KEY(userId) REFERENCES Users(userId)
);