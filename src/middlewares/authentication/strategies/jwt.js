import 'dotenv/config';
import passportJWT from 'passport-jwt';
import { User } from '../../../user/user.mdl';

const { Strategy: JwtStrategy, ExtractJwt } = passportJWT;

const opts = {};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET;
opts.ignoreExpiration = false;
/* eslint-disable-next-line consistent-return */
const jwt = new JwtStrategy(opts, async (payload, done) => {
  try {
    const [userLogin] = await User.query()
      .withGraphFetched('user(authSelects)');

    if (!userLogin) return done(null, false);
    if (!userLogin.user) return done(null, false);
    if (userLogin.user.blocked) return done({ code: 403, message: 'user blocked' }, false);
    if (!userLogin.user.verified_email) return done({ code: 403, message: 'email not verified' }, false);
    return done(null, userLogin.user);
  } catch (e) {
    return done(null, false);
  }
});

export default jwt;
