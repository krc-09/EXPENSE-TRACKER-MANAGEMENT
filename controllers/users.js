const Users = require('../Models/users')

exports.postSignupDetails = (req,res,next) =>{
const name = req.body.name;
const  email  = req.body.email;
const password = req.body.password;

 if(!name){
    res.status(400).json({error:'Name is mandatory'});
 }
 if(!email){
    res.status(400).json({error:'Email is mandatory'});
 }
 if(!password){
    res.status(400).json({error:'Password is mandatory'});
 }

 Users.create({
    name:name,
    email:email,
    password:password
 }).then(() => {

    Users.findAll();
 }).then(users =>{
    res.status(201).json(users);
 }).catch((err) => {console.log(err)});


};


