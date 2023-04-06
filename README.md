To begin working on the backend side of a project, follow these steps:

* go to a directory where you want to save the Project and run these commands :

  ````
  mkdir BlogPost
  cd BlogPost
  git clone git@github.com:Blog-Post-Group-1/blog-post-back-end.git
  cd blog-post-back-end
  ````

* run these commands to install librarys :

  ````
  npm install express cors
  npm install -g nodemon
  npm install dotenv
  npm i pg
  npm install axios
  npm install body-parser --save
  npm install openai
  ````

* Create a .env file in the root directory run this commands

  ````
  touch .env
  ````

* add this to .env file

  ````
  PORT=3000
  DATABASE_URL=postgres://localhost:5432/blogify
  OPENAI_API_KEY="INSERT YOUR OPENAI API KEY HERE"
  NEWS_API_KEY="INSERT YOUR API KEY HERE"
  ````

* prepare the Database server using this command :

  ````
  sqlstart 
  ````

  ````
  psql
  ````

  ````
  CREATE DATABASE blogify;
  ````

  ````
  \c blogify
  ````

  ````
  \q
  ````

  ````
  psql -d blogify -f usersSchema.sql
  psql -d blogify -f postsSchema.sql
  psql -d blogify -f commentsSchema.sql
  ````

* check if the 3 tables is created :

  ````
  psql
  ````

  ````
  \c blogify
  ````

  ````
  \dt
  ````

  ````
  \q
  ````

* start the server

  ````
   nodemon
  ````

* Test The Routes

  ````
  http://localhost:3000/
  http://localhost:3000/home 
  ````

* to stop the Database server using this command :

  ````
    sqlstop
  ````
