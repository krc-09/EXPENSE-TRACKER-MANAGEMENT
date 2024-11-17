const Sequelize = require('sequelize');
const sequelize = require('../utils/database');
const FileUrl = sequelize.define('fileUrl',

  {
    id:{

      type:Sequelize.INTEGER,
      autoIncrement:true,
      allowNull:false,
      primaryKey:true
    },
   
    url:{
      type:Sequelize.STRING,
      
  }

  });
module.exports = FileUrl;