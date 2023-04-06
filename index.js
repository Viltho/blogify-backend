'use strict';

//import the express framework
const express = require('express');
//import cors
const cors = require('cors');
//import axios
const axios = require('axios');
//Database - > importing the pg 
const pg = require('pg');

var bodyParser = require('body-parser')

const { Configuration, OpenAIApi } = require("openai");


const server = express();

//server open for all clients requests
server.use(cors());


// Load the environment variables into your Node.js
require('dotenv').config();

//Set Port Number
const PORT = process.env.PORT || 5500;
//create obj from Client
const client = new pg.Client(process.env.DATABASE_URL);


// parse application/x-www-form-urlencoded
server.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
server.use(bodyParser.json())


//OpenAI API Configuration
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

//Routes

server.get('/', startHandler)
server.get('/home', homeHandler)
server.get('/getUserPosts/:id', getUserPostsHandler)
server.get('/getPostById/:id', getPostByIdHandler)
server.post('/addUsers', addUsersHandler)
server.get('/getUsers', getUsersHandler)
server.post('/addPost', savePostHandler)
server.get('/getAllPosts', getAllPostsHandler)
server.put('/updateComment/:id', updateCommentIdHandler)
server.get('/getAllComment/:id', getAllCommentHandler)
server.post('/saveComment', saveCommentHandler)
server.delete('/deleteComment/:id', deleteCommentHandler)
//API Route
server.get('/topHeadlines', topHeadlinesAPIHandler)
server.put('/updatepost/:id', updatePostHandler)
server.delete('/deletepost/:id', deletePostHandler)
server.post('/increasepostlikes/:id', increaseLikesHandler)
server.post('/decreespostlikes/:id', decreesLikesHandler)
server.get('/getProfileById/:id', getProfileByIdHandler)
server.put('/updateprofil/:id', updateProfilHandler)
server.post('/getUserIdByEmail', getUserIdByEmailHandler)
// server.get('/generateByAi',) exist at the bottom



// Functions Handlers

function startHandler(req, res) {
    res.send("Hello from the Start route");
}

function homeHandler(req, res) {
    res.send("Hello from the home route");
}

function addUsersHandler(req, res) {
    const user = req.body;
    const checkEmailSql = `SELECT * FROM Users WHERE email=$1;`;
    const checkEmailValues = [user.email];
    client.query(checkEmailSql, checkEmailValues)
        .then((result) => {
            if (result.rowCount > 0) {
                res.status(200).send(result.rows);
            } else {
                const sql = `INSERT INTO Users (userFullName, email) VALUES ($1, $2) RETURNING *;`;
                const values = [user.userFullName, user.email];
                client.query(sql, values)
                    .then((data) => {
                        res.send(data.rows);
                    })
                    .catch(error => {
                        errorHandler(error, req, res);
                    });
            }
        })
        .catch((error) => {
            errorHandler(error, req, res);
        });
}



function getUsersHandler(req, res) {
    const sql = `SELECT userid,email FROM Users;`
    client.query(sql)
        .then((data) => {
            res.send(data.rows);
        })
        .catch(error => {
            res.send('error');
        });
}

function savePostHandler(req, res) {
    const Post = req.body;
    const sql = `INSERT INTO Posts (userId, title, content,imageURL) VALUES ($1, $2, $3,$4) RETURNING *;`
    const values = [Post.userId, Post.title, Post.content, Post.imageURL];
    client.query(sql, values)
        .then((data) => {
            res.send("your data was added !");
        })
        .catch(error => {
            errorHandler(error, req, res);
        });
}



// (GET) /getAllPosts: get list of all blog posts created by all users. (Database Join between Posts and User )
//  (postId ,userId ,imageURL ,title ,content ,numberOfLikes,Created_at , userFullName , imageURL AS userImageURL) sorted by created_at
function getAllPostsHandler(req, res) {
    const sql = 'SELECT Posts.postId ,Users.userId ,Users.userFullName, Users.imageURL AS userImageURL , Posts.postId  , Posts.imageURL , Posts.title , Posts.content  , Posts.numberOfLikes , Posts.Created_at  FROM Users INNER JOIN Posts ON Users.userId=Posts.userId  ORDER BY Created_at DESC ;'
    client.query(sql)
        .then((data) => {
            res.send(data.rows);
        })
        .catch(error => {
            res.send('error');
        });
}


function getUserPostsHandler(req, res) {
    const id = req.params.id;
    const sql = `SELECT Users.userId ,
                        Posts.postId ,
                        Users.userFullName ,
                        Users.imageURL AS userImageURL ,
                        Posts.imageURL,
                        Posts.title ,
                        Posts.content ,
                        Posts.numberOfLikes ,
                        Posts.Created_at 
                FROM Posts
                INNER JOIN Users ON Posts.userId =Users.userId 
                WHERE Posts.userId=${id}
                ORDER BY Posts.Created_at DESC;`;

    client.query(sql)
        .then((data) => {
            res.send(data.rows);
        })
        .catch((err) => {
            errorHandler(err, req, res);
        })
}

function getPostByIdHandler(req, res) {
    const id = req.params.id;
    const sql = `SELECT Users.userId ,
                        Posts.postId ,
                        Users.userFullName ,
                        Users.imageURL AS userImageURL ,
                        Posts.imageURL,
                        Posts.title ,
                        Posts.content ,
                        Posts.numberOfLikes ,
                        Posts.Created_at  
                FROM Posts 
                INNER JOIN Users ON Posts.userId = Users.userId
                WHERE postId=${id}`;
    client.query(sql)
        .then((data) => {
            res.send(data.rows);
        })
        .catch((err) => {
            errorHandler(err, req, res);
        })

}
function updatePostHandler(req, res) {
    const id = req.params.id;
    if (!isNaN(id)) {
        const Post = req.body;
        const sql = `UPDATE Posts SET title =$1 , content  =$2 , imageURL =$3 WHERE postId = ${id} RETURNING *;`
        const values = [Post.title, Post.content, Post.imageURL];

        client.query(sql, values)
            .then((data) => {
                res.status(200).send(data.rows);
            })
            .catch(error => {
                errorHandler(error, req, res);
            });
    }
    else {
        res.send("Id Must Be Numaric");
    }
}

function deletePostHandler(req, res) {
    const postId = req.params.id;
    if (!isNaN(postId)) {
        const deleteCommentsQuery = `DELETE FROM Comments WHERE postId = $1;`;
        const deletePostQuery = `DELETE FROM Posts WHERE postId = $1;`;
        client.query(deleteCommentsQuery, [postId])
            .then(() => client.query(deletePostQuery, [postId]))
            .then(() => res.send("Post and associated comments deleted successfully."))
            .catch((err) => errorHandler(err, req, res));
    } else {
        res.send("Id Must Be Numeric");
    }

}

function increaseLikesHandler(req, res) {
    const id = req.params.id;
    if (!isNaN(id)) {
        const sql = `UPDATE posts SET numberOfLikes = numberOfLikes + 1 WHERE postId =${id} RETURNING *`
        client.query(sql)
            .then((data) => {
                res.status(200).send(data.rows);

            })
            .catch(error => {
                errorHandler(error, req, res);
            });
    }
    else {
        res.send("Id Must Be Numaric");
    }
}


function decreesLikesHandler(req, res) {
    const id = req.params.id;
    if (!isNaN(id)) {
        const sql = `UPDATE posts SET numberOfLikes = numberOfLikes -1 WHERE postId =${id} RETURNING *`
        client.query(sql)
            .then((data) => {
                res.status(200).send(data.rows);

            })
            .catch(error => {
                errorHandler(error, req, res);
            });
    }
    else {
        res.send("Id Must Be Numaric");
    }
}

// NewsAPI  constructor 

function News(title, description, url, urlToImage) {
    this.title = title;
    this.description = description;
    this.url = url;
    this.urlToImage = urlToImage;
}

function updateCommentIdHandler(req, res) {
    const id = req.params.id;
    if (!isNaN(id)) {
        const comm = req.body.Content;
        const sql = `UPDATE Comments SET  Content = $1 WHERE commentId = $2 RETURNING *;`;
        const values = [comm, id];
        client.query(sql, values)
            .then((data) => {
                res.status(200).send(data.rows);
            })
            .catch(error => {
                errorHandler(error, req, res);
            });
    }
    else {
        res.send("Id Must Be Numaric");
    }
}

function topHeadlinesAPIHandler(req, res) {

    try {
        const APIKey = process.env.NEWS_API_KEY;
        const URL = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${APIKey}`;
        axios.get(URL)
            .then((newsResult) => {
                let mapResult = newsResult.data.articles.map((item) => {
                    return new News(item.title, item.description, item.url, item.urlToImage);
                });
                res.send(mapResult);
            })
            .catch((err) => {
                console.log("sorry", err);
                res.status(500).send(err);
            })
    }

    catch (error) {
        errorHandler(error, req, res);
    }
}


function getAllCommentHandler(req, res) {
    const id = req.params.id;
    const sql = `SELECT Comments.commentId,
                        Comments.postId,
                        Comments.userId,
                        Comments.Content,
                        Users.userFullName,
                        Users.imageURL AS userImageURL,
                        Comments.Created_at
                FROM Comments
                INNER JOIN Users ON Comments.userId = Users.userId
                WHERE Comments.postId=${id}
                ORDER BY Comments.Created_at DESC;`;
    client.query(sql)
        .then((data) => {
            res.send(data.rows);

        })
        .catch((err) => {
            errorHandler(err, req, res);
        })

}

function saveCommentHandler(req, res) {
    const newComment = req.body;
    const sql = `INSERT INTO Comments (postId, userId ,Content) VALUES ($1,$2,$3) RETURNING *;`;
    const values = [newComment.postId, newComment.userId, newComment.Content];
    client.query(sql, values)
        .then((data) => {
            res.send("your data was added !");
        })
        .catch((err) => {
            errorHandler(err, req, res);
        })
    // res.send("Hello from the home route");
}

function getProfileByIdHandler(req, res) {
    const id = req.params.id;
    if (!isNaN(id)) {
        const sql = `SELECT Users.userFullName  ,
                        TO_CHAR(dateOfBirth, 'YYYY/MM/DD') as dateOfBirth ,
                        Users.email ,
                        Users.imageURL AS userImageURL ,
                        Users.bio 
                FROM Users 
                WHERE userId =${id}`;
        client.query(sql)
            .then((data) => {
                res.send(data.rows);
            })
            .catch((err) => {
                errorHandler(err, req, res);
            })

    }
    else {
        res.send("Id Must Be Numaric");
    }

}


function deleteCommentHandler(req, res) {
    const id = req.params.id;
    if (!isNaN(id)) {
        const sql = `DELETE FROM Comments WHERE commentId=${id}`;
        client.query(sql)
            .then((data) => {
                res.send("your data was deleted successful");
            })
            .catch((err) => {
                errorHandler(err, req, res);
            })
    }
    else {
        res.send("Id Must Be Numaric");
    }

}



function updateProfilHandler(req, res) {
    
    const id = req.params.id;
    if (!isNaN(id)) {
        const User = req.body;
        const sql = `UPDATE Users SET userFullName =$1 ,
                                      dateOfBirth  =TO_DATE($2, 'YYYY/MM/DD'),
                                       imageURL =$3,
                                       bio=$4 
                    WHERE userId = ${id} RETURNING
                    TO_CHAR(Users.dateOfBirth, 'MM/DD/YYYY') as dateOfBirth,
                    Users.userFullName,
                    Users.email ,
                    Users.imageURL AS userImageURL ,
                    Users.bio ;`
        const values = [User.userFullName, User.dateOfBirth, User.imageURL, User.bio];

        client.query(sql, values)
            .then((data) => {
                res.status(200).send(data.rows);
            })
            .catch(error => {
                errorHandler(error, req, res);
            });
    }
    else {
        res.send("Id Must Be Numaric");
    }
}


function getUserIdByEmailHandler(req, res) {
    const email = req.body.email;
    const sql = `SELECT userId FROM Users WHERE email = '${email}'`;
    client.query(sql)
        .then((data) => {
            res.send(data.rows);
        })
        .catch((err) => {
            errorHandler(err, req, res);
        })
}

server.get('/generateByAi', async function (req, res) {
    const prompt = `create for me blog post about ${req.query.title} and do not start with Sure`;
    openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 2048,
    }).then(function (completion) {
        res.send(completion.data.choices[0].text);
    }).catch(function (err) {
        errorHandler(err, req, res);
    });
});

// 404 errors
server.get('*', (req, res) => {
    const errorObj = {
        status: 404,
        responseText: 'Sorry, page not found'
    }
    res.status(404).send(errorObj);
})


//middleware function
function errorHandler(err, req, res) {
    const errorObj = {
        status: 500,
        massage: err
    }
    res.status(500).send(errorObj);
}

// server errors
server.use(errorHandler)


//connect the server with Blogify database
// http://localhost:3000 => (Ip = localhost) (port = 3000)
client.connect()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`listening on ${PORT} : I am ready`);
        });
    })