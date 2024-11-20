<<<<<<< HEAD

require('dotenv').config(); 
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME,process.env.DB_USERNAME,process.env.DB_PASSWORD,{

    dialect : 'mysql',
    host:process.env.DB_HOST
=======
const Sequelize = require('sequelize');
const sequelize = new Sequelize('expense-tracker-app','root','password',{

    dialect : 'mysql',
    host:'localhost'
>>>>>>> 4ec143124690b802c7905c1975b5df9a06201365

});
module.exports = sequelize;