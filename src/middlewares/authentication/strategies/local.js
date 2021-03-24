import jwt from 'jsonwebtoken';
import Strategy from 'passport-local';
import bcrypt from 'bcrypt';
import { Login } from '../../../user/login.mdl';
import knex from '../../../base';

const secret = process.env.SECRET;
// =========================================================================
// LOCAL LOGIN =============================================================
// =========================================================================
// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called 'local'

export default new Strategy({
  // by default, local strategy uses username and password, we will override with email
  usernameField: 'login',
  passwordField: 'password',
  // passReqToCallback: true, // allows us to pass back the entire request to the callback
  session: false,
},
async (login, password, done) => { // callback with email and password from our form
  const [userLogin] = await Login.query().select('*')
    .withGraphFetched('user(defaultSelects)')
    .where(knex.raw(`LOWER("email") = '${login.toLowerCase()}'`))
    .orWhere(knex.raw(`LOWER("login") = '${login.toLowerCase()}'`))
    .limit(1)
    .catch((e) => { done(e, null); });

  console.log('userLogin > ', userLogin);
  if (userLogin) {
    if (userLogin.user.blocked) {
      const error = { code: 400, message: 'user blocked' };
      return done(error, null);
    }
    if (!userLogin.verified_email) {
      const error = { code: 400, message: 'please verify your email' };
      return done(error, null);
    }
    const samePassword = await bcrypt.compare(password, userLogin.password)
      .catch((bcryptError) => done(bcryptError, null));
    if (samePassword) {
      delete userLogin.user.login.password;
      delete userLogin.user.login.email_verification_token;
      const result = Object.assign(userLogin.user, {
        token: jwt.sign({
          id: userLogin.user.id,
        }, secret, { expiresIn: 60 * 60 }), // 60 * 60
      });
      return done(null, result);
    }
    const error = { code: 400, message: 'wrong credentials' };
    return done(error, null);
  }
  const error = { code: 400, message: 'wrong credentials' };
  return done(error, null);
});
