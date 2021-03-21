const { v4: uuid } = require('uuid');
const bcrypt = require('bcrypt');

exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(() => knex('users').insert([
      {
        role: 'superadmin',
      },
    ]));
};
