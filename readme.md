#Assignment 1

In this assignment we are creating a backend application which performs CRUD operations of a user using the help of
different api's.


The folder structure is as follows:
The main script where the server is starting is in index.js.
The routes of the api's are in routes folder
The database schema is present in models/userModel.
The api logic is present in controllers/user.js
The db details are present in db.js and .env file contains the environment details.
Tests are written in tests/test.js

The controller contains 3 main methods:
createUser which is a POST method and takes in firstname, lastname, username and password.
getUser which is a GET method and takes userid as a parameter and fetches the data of the user
editUser which is a PUT method and also takes the userid parameter to update the data.

the GET and PUT method are authenticated that means they require authentication to work.

In this assignment we are using sequelize orm instead of using queries to create tables, insert data and fetch values.

We test the api's using Postman.

we have also created a .github/workflows folder/file which contains the yml file. The yml file contains the workflow structure which allows github to know whenever we push the code to our branch.

Whenever a pull request us created from our feature branch in our fork to the main branch in our org, workflow is triggered and checks if all the test cases are passing.

Only if all test cases are passing, then we should be able to merge our changes.

#Assignment 2

In this assignment we have added a ProductModel where it contains the fields name, description, manufacturer, sku and quantity.

There are 5 apis being used here and the endpoints are as follows

POST: http://localhost:3000/v1/product

GET: http://localhost:3000/v1/product/productId

PUT: http://localhost:3000/v1/product/productId

PATCH: http://localhost:3000/v1/product/productId

DELETE: http://localhost:3000/v1/product/productId

SOme requirements for this assignment are-

-Only authenticated users are allowed to add products
-Only people who added a product can update and delete the product
-Anyone can use the get method to fetch products.

#Assignment 4

Prerequisites: The web application has been built using nodeJS, PostgresSql as the database. The APIs implemented are GET, POST and PUT as per the given requirements.
Packer to be installed and added to the environment variables path
The API's can be tested with the Postman with the correct routes as configured.

Requirements and Description: The payload will be sent in JSON format in the body of the request. No UI has been implemented in this application.
The API calls will return proper HTTP status codes
A packer template is written in pkr.hcl format with the required provisioner files like the node.sh, postgres.sh to validate and build the packer with the configured local source directory and remote destination directory. Also added under provisioner files are the zip of the webapp and the systemd service file with the commands to execute and start the ec2 server for the ec2-user


Steps to run the project:

1. Raise a pull request from the fork branch to the organization main in the webapp repository with any small change
2. The above PR will trigger a github workflow to merge pull which will inturn start the actions to invoke the packer file to run the ami.pkr.hcl.
3. The successful completion of actions will result in an AMI being created in the dev aws console as per the github secret keys and variables set.
4. The AMI created is to be copied on to the var.tfvars of the clones aws-infra repository.
5. Terraform apply command with var.tfvars file will create the ec2 instance in the dev/demo aws console account as per required inputs with the associated AMI created.
6. The AMI created in dev is also shared with the demo account using the account id configured while running the packer template file.
7. The public IP is to be copies onto the postman and run the APIs as required to test the application functionalities
8. A server is setup in localhost on port 3000 as default. The port environment variable can be configured as required before running the server.
9. To test the API end points, open Postman and execute the below 
    POST API
   1. Configure the method as 'POST' Enter http://{public_IP_of_EC2}:3000/v1/user in the request url
   2. Add first_name, last_name, username (email id), password in the json format in the request body and click send.
   3. The details entered except for the password are displayed in the response along with additional autogenerated fields like id, account_created and account_updated

    GET API
   4. Configure the method as 'GET' Enter http://{public_IP_of_EC2}:3000/v1/user/{ID} in the request url
   5. Set the authorization to basic authentication and enter the registered username as the email id and the password
   6. Also, add the id of the user in the url and click send to get the data

    PUT API
  1. Configure the method as 'PUT' Enter http://{public_IP_of_EC2}:3000/v1/user/{ID} in the request url
   2. Set the authorization to basic authentication and enter the registered username as the email id and the password
   3. Also, add the id of the user in the url
   4. The user will only be able to update the first_name, last_name and the password.
   5. Click send to update the data in the database
   6. The data will get updated in the table as requested


The RESTful API Endpoints implemented for products are

1. POST - to add new products to the table in the database POST is used. The values to be given in JSON are name, description, sku, manufacturer and quantity. API address is http://{public_IP_of_EC2}:3000/v1/product. If any one field is missing then the error message is "Incomplete Data". Basic authorization is used to check if the user exists. Only existing/authorized users can post the products.
 
2. GET - to view all the values present in the table GET is used. sku of the particular product should be given in the url for the POSTMAN to show the response. API address will be http://{public_IP_of_EC2}:3000/v1/product/{sku}. no authentication is done here.
 
3. PUT/PATCH - to update the values like name, description, sku, quantity and manufacturer PUT/PATCH is used. sku should be a unique value. Basic authorization should happen successfully when a user wants to update the values. API address will be http://{public_IP_of_EC2}:3000/v1/product/{sku}. The values that need to be updated should be given in the json format. The response for this call is the 'Data is Updated' message. Only user who creates the product can update the details

4. DELETE - to delete the row in the table products basic authentication have to be successful and only user who creates the product can delete it. API address will be http://{public_IP_of_EC2}:3000/v1/product/{sku}




Assignment5

In this assignment we are adding 4 new routes in our web application

POST : v1/product/productID/image -> to post a new image

GET : v1/product/productID/image -> to get all images

GET : v1/product/productID/image/imageId -> to get specific image

DELETE : v1/product/productID/image/imageId -> to delete a specific image

When we post and delete images , they should get uploaded and deleted in the S3 bucket in Aws ec2 instance

This assignment should ensure that our app runs in the ec2 instance and get connected to the rds instance.

