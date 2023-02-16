const sequelize = require('../db');
const logger = require('../logging');
const res = require('../utils/responseLib');
//const statsD = require('node-statsd');
const {
    emailValidation,
    hashingOfPassword,
    basicAuthenticationHandler,
    passwordCheckFunction,
    randomStringAsBase64Url
} = require('../utils/controller.utility');

const products = require('../models/productModel');
const users = require('../models/userModel');
const { response } = require('../app');

let userFlag = false;

//POST Method

const createProduct = (request, response) => {

    const [username, password] = basicAuthenticationHandler(request);
    const { name, description, sku, manufacturer, quantity } = request.body;
    

    if (!username || !password) {
        return response.status(401).json("Please provide Username and Password");
    }

   

    let returnValue = null;
    returnValue = intermediateMethodToUpdate(request, response, username);
    if(returnValue !== true) {
        return;
    }

    users.findOne({ where: { username: username } }).then((user) => {

        if (user) {

            const hashPassword = user.password;

            passwordCheckFunction(hashPassword, password).then((valueToCompare) => {
                if (valueToCompare) {

                    
                    console.log(!quantity);
                    if ((!name || !description || !sku || !manufacturer || !quantity) && quantity!= 0) {
                        return response.status(400).json("Incomplete Data");
                    }

                    else if (quantity<0 && quantity>100 && quantity.isInteger()){
                        return response.status(400).send('Quantity Should be in between 0 and 100');
                    }
                    



                    products.findOne({ where: { sku: sku } }).then((product) => {
                        if (product) {
                            return response.status(400).send(res.generate(true, 'Product with same sku Already Exists', 400, {}));
                        }
                        else {

                            products.create({

                                name: name,
                                description: description,
                                sku: sku,
                                manufacturer: manufacturer,
                                quantity: quantity,
                                date_added: new Date().toISOString(),
                                date_last_updated: new Date().toISOString(),
                                owner_user_id: user.id
                            }).then((result) => {

                               return response.status(201).send(res.generate(false, 'Product added successfully', 201, result));
                            }).catch((error) => {
                                response.status(400).send('Error inserting data to products table.Quantity should be in between 0 and 100.');
                                console.log(error);
                            });


                        }
                    });

                }else {
                    response.status(401).send('Invalid Password');
                }
            })


        } else {
            response.status(401).send('User not found');
        }



    }).catch((error) => {
        response.status(400).send('Cannot fetch User');
    });



}

//Get Method

const getProduct = (request, response) => {

    products.findByPk(request.params.productId).then((result) => {
        if(result){
            return response.status(200).send(res.generate(false,'Product fetched', 200, result));
        }else {
            return response.status(400).send(res.generate(true,'Product with productId ' + request.params.productId +' does not exist', 400, result));
        }
        
    }).catch((error) => {
        return response.status(400).send(res.generate(true,'Product fetch failed', 400, {}));
    })

}

//PUT Method

const updateProduct = (request, response) => {

    const [username, password] = basicAuthenticationHandler(request);

    if (!username || !password) {
        return response.status(401).json("Please provide Username and Password");
    }

    const { name, description, sku, manufacturer, quantity } = request.body;

    if ((!name || !description || !sku || !manufacturer || !quantity) && quantity!= 0) {
        return response.status(400).json("Incomplete Data");
    }

   // intermediateMethodToUpdate(request, response, username);

   let returnValue = null;
                returnValue = intermediateMethodToUpdate(request, response, username);
                if(returnValue !== true) {
                    return;
                }

    users.findOne({ where: { username: username } }).then((user) => {

        if (user) {

            products.findOne({where:{id:request.params.productId}}).then((record) => {
                if(record) {
                    if(record.owner_user_id == user.id){

                        const hashPassword = user.password;
    
                        passwordCheckFunction(hashPassword, password).then((valueToCompare) => {
                            if (valueToCompare) {
            
                                   // console.log("sku is " + request.body.sku);
                                   if(request.body.sku){
                                    products.findOne({where:{sku:request.body.sku}}).then((result) => {
                                        if(result){
                                            response.status(400).send("sku "+ request.body.sku + " already exists");
                                        }
                                      
                                        else{
                                            products.update(request.body, {where:{id: request.params.productId}}).then((updatedData) => {
                                      
                                                response.status(204).send('Data is Updated');
                                                
                                             }).catch((error)=> {
                                                 response.status(400).send("Error updating Data. Quantity should be in between 0 and 100.")
                                             });
                                        }
                                    })
                                   }
                                   else {
                                    products.update(request.body, {where:{id: request.params.productId}}).then((updatedData) => {
                                      
                                        response.status(204).send('Data is Updated');
                                        
                                     }).catch((error)=> {
                                         response.status(400).send("Error updating Data. Quantity should be in between 0 and 100")
                                     });
            
                                    }
            
                                     products.update({date_last_updated:new Date().toISOString()},{where:{sku: request.params.productId}}).catch((error)=>
                                     {
                                        response.send('error updating date_last_updated');
                                     });
                               
                            } else {
                                response.status(401).send(res.generate(true,'Invalid Password',401,{}));
                            }
                        });
    
                    }else {
                        response.status(403).send('Product not added by ' + user.username);
                    }
                } else {
                    response.status(400).send('Product with productId ' + request.params.productId + " does not exist");
                }
               
            })

          
        }else {
            response.status(401).send('No user found');
        }

    }).catch((error) => {
        response.send('No user found');
        console.log('No user found');
    });



}

//Patch Method

const editProduct = (request,response) => {
    const [username, password] = basicAuthenticationHandler(request);

    if (!username || !password) {
        return response.status(401).json("Please provide Username and Password");
    }

    let returnValue = null;
                returnValue = intermediateMethodToUpdate(request, response, username);
                if(returnValue !== true) {
                    return;
                }

    users.findOne({ where: { username: username } }).then((user) => {

        if (user) {

            products.findOne({where:{id:request.params.productId}}).then((record) => {
                if(record){
                if(record.owner_user_id == user.id){

                    const hashPassword = user.password;

                    passwordCheckFunction(hashPassword, password).then((valueToCompare) => {
                        if (valueToCompare) {
        
                               // console.log("sku is " + request.body.sku);
                               if(request.body.sku){
                                products.findOne({where:{sku:request.body.sku}}).then((result) => {
                                    if(result){
                                        response.status(400).send("sku "+ request.body.sku + " already exists");
                                    }
                                  
                                    else{
                                        const patchProduct = {                                           
                                                name: request.body.name,
                                                description: request.body.description,
                                                sku: request.body.sku,
                                                manufacturer: request.body.manufacturer,
                                                quantity: request.body.quantity,
                                                date_last_updated: new Date().toISOString(),
                                          
                                        };
                                        products.update(patchProduct, {where:{id: request.params.productId}}).then((updatedData) => {
                                  
                                            response.status(204).send('Data is Updated');
                                            
                                         }).catch((error)=> {
                                             response.status(400).send("Error updating Data.Quantity should be in between 0 and 100.")
                                         });
                                    }
                                })
                               }
                               else {
                                products.update(request.body, {where:{id: request.params.productId}}).then((updatedData) => {
                                  
                                    response.status(204).send('Data is Updated');
                                    
                                 }).catch((error)=> {
                                     response.status(400).send("Error updating Data.Quantity should be in between 0 and 100.")
                                 });
        
                                }
        
                                 products.update({date_last_updated:new Date().toISOString()},{where:{id: request.params.productId}}).catch((error)=>
                                 {
                                    response.send('error updating date_last_updated');
                                 });
                           
                        } else {
                            response.status(401).send(res.generate(true,'Invalid Password',401,{}));
                        }
                    });

                }else {
                    response.status(403).send('Product not added by ' + user.username);
                }
            }else {
                response.status(400).send('Product with productId ' + request.params.productId +' does not exist');
            }
            })

          
        }else {
            response.status(401).send('No user found');
        }

    }).catch((error) => {
        response.send('No user found');
        console.log('No user found');
    });
}

const intermediateMethodToUpdate = (request, response, username) => {
    const importantFields = ["name", "description", "manufacturer","sku","quantity"];
    const RequestBodyKeys = request.body ? Object.keys(request.body) : null;
    let flag = true;
    if (!RequestBodyKeys || !RequestBodyKeys.length) {
        return response.status(400).json("Correct details are not provided for updation of information");
    }
    RequestBodyKeys.forEach(val => {
        if (importantFields.indexOf(val) < 0) {
            flag = false;
        }
    })
    if (!flag) {
        userFlag = true;
        return response.status(401).json("You can add or update name, description,manufacturer,sku and quantity only!");
    }

    //const account_updated = new Date().toISOString();

    return true;
 
}

//Delete Method

const deleteProduct = (request, response) => {

    const [username, password] = basicAuthenticationHandler(request);

    if (!username || !password) {
        return response.status(401).json("Please provide Username and Password");
    }

    users.findOne({ where: { username: username } }).then((user) => {

        if (user) {

            products.findOne({where:{id:request.params.productId}}).then((record) => {
                if(record){
                if(record.owner_user_id == user.id){

                    const hashPassword = user.password;

                    passwordCheckFunction(hashPassword, password).then((valueToCompare) => {
                        if (valueToCompare) {
                            products.destroy({where:{id :request.params.productId}}).then((result) => {
                                response.status(204).send('Data deleted');
                            }).catch((error) => {
                                response.status(400).send('Data destroy failed');
                            })
                        }else {
                            response.status(401).send('Invalid Password');
                        }
                    });

                } else {
                    response.status(403).send('Product not added by ' + user.username);
                }
            }else {
                response.status(404).send('Product with productId ' + request.params.productId +' does not exist');
            }
            }).catch((error) => {
                response.status(400).send('"Error Deleting Data');
            });

         

        } else {
            response.status(404).send('User not found');
        }

    }).catch((error) => {
        response.status(400).send('error fetching user');
    });


}

const getHealth = (request, response) => {
    return response.status(200).json("Health is OK");
}

module.exports = {
    createProduct,
    getProduct,
    updateProduct,
    editProduct,
    getHealth,
    deleteProduct

}
