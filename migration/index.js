require('dotenv').config()
const { Model } = require('objection');
const kn = require('knex')({
  client: process.env.DB_type,
  connection: {
    host: process.env.DB_host,
    port: process.env.DB_port,
    user: process.env.DB_user,
    password : process.env.DB_pass,
    database : process.env.DB_name
  }
});

kn.raw(`CREATE DATABASE ${process.env.DB_name}`)
  .then(console.log('>>>>>>>>>>>>>>>>>>>>DATABASE CREATED<<<<<<<<<<<<<<<<<<<<'))
  .catch(console.log('>>>>>>>>>>>>>>>>>>>>FAILED TO CREATE DATABASE<<<<<<<<<<<<<<<<<<<<'));
Model.knex(kn);

