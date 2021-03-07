import jwt from 'jsonwebtoken';
import Strategy from 'passport-local';
import bcrypt from 'bcrypt';
import { Users } from '../../../auth/auth.mdl';
import knex from '../../../base';

const secret = process.env.SECRET;
// =========================================================================
// LOCAL SIGNUP ============================================================
// =========================================================================
// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called 'local'

export const signup = new Strategy({
  // by default, local strategy uses username and password, we will override with email
  // usernameField: 'login',
  // passwordField: 'password',
  passReqToCallback: true, // allows us to pass back the entire request to the callback
},
(req, login, password, done) => {
  // asynchronous
  // User.findOne wont fire unless data is sent back
  process.nextTick(() => {
    // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
  });
});
// =========================================================================
// LOCAL LOGIN =============================================================
// =========================================================================
// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called 'local'

export const login = new Strategy({
  // by default, local strategy uses username and password, we will override with email
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true, // allows us to pass back the entire request to the callback
},
(req, email, password, done) => { // callback with email and password from our form
  const [user] = Users.query().select('*').limit(1) // .withGraphFetched('profile')
    .where(knex.raw(`LOWER("email") = '${login.toLowerCase()}'`))
    .orWhere(knex.raw(`LOWER("login") = '${login.toLowerCase()}'`));

  if (user) {
    if (user.blocked) {
      const error = { code: 400, message: 'user blocked' };
      done(error, null);
    }
    if (!user.verified_email) {
      const error = { code: 400, message: 'please verify your email' };
      done(error, null);
    }
    const samePassword = bcrypt.compareSync(password, user.password);
    if (samePassword) {
      const result = Object.assign(user, {
        token: jwt.sign({
          id: user.id,
        }, secret, { expiresIn: 60 * 60 }), // 60 * 60
      });
      delete result.password;
      done(null, result);
    }
  }
  const error = { code: 400, message: 'wrong credentials' };
  done(error, null);
  // find a user whose email is the same as the forms email
  // we are checking to see if the user trying to login already exists
});
