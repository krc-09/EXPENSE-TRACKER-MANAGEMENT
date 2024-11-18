const Sequelize = require('sequelize');
const sequelize = require('../utils/database');
const Users = sequelize.define('users',

  {
    id:{

      type:Sequelize.INTEGER,
      autoIncrement:true,
      allowNull:false,
      primaryKey:true
    },
    
   name:{
      type:Sequelize.STRING,
      allowNull:false
     
    },
    email:{
        type:Sequelize.STRING,
        allowNull:false,
        unique: true, 
    validate: {
      isEmail: true 
    }
       
      },
   password:{
      type:Sequelize.STRING,
      allowNull:false
    },ispremiumuser:Sequelize.BOOLEAN,
    totalExpenses:{
      type:Sequelize.INTEGER,
      defaultValue:0
    }
 

  });
module.exports = Users;