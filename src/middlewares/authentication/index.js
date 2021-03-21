import passport from 'passport';
import jwt from './strategies/jwt';
import local from './strategies/local';
import facebook from './strategies/facebook';
// import google from './strategies/google';

passport.use('jwt', jwt);
passport.use('local', local);
passport.use('facebook', facebook);
// passport.use('google', google);

// middleware for doing role-based permissions
export function permit(...allowed) {
  const isAllowed = (role) => allowed.indexOf(role) > -1;
  return (req, res, next) => {
    if (req.user && isAllowed(req.user.role)) {
      next();
    } else { res.status(403).json({ message: 'Forbidden' }); }
  };
}

export const pass = passport;
