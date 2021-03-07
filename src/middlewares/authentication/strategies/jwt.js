import 'dotenv/config';
import passportJWT from 'passport-jwt';
import { Users } from '../../../auth/auth.mdl';

const secret = process.env.SECRET;
const { Strategy: JwtStrategy, ExtractJwt } = passportJWT;

const opts = {};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = secret;

opts.ignoreExpiration = false;
/* eslint-disable-next-line consistent-return */
const jwt = new JwtStrategy(opts, async (payload, done) => {
  try {
    const [user] = await Users.query() // .withGraphFetched('profile')
      .select('*')
      .where({ id: payload.id })
      .limit(1);
    if (!user) return done(null, false);
    if (user.blocked) return done({ code: 403, message: 'user blocked' }, false);
    if (!user.verified_email) return done({ code: 403, message: 'email not verified' }, false);
    done(null, user);
  } catch (err) {
    return done(err, false);
  }
});

export default jwt;
