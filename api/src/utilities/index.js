// import chalk from 'chalk';
import weblog from './web.logging';

export const serverError = { code: 500, message: 'Internal server error' };

export function response(res, data = {}, statusCode = 200) {
  return res.status(statusCode).json(data);
}

export function responsWithError(displayError, req, res, error = {}) {
  try {
    const {
      user, originalUrl, connection, body, params, query, method,
    } = req;
    const userEmail = user ? user.email : undefined;
    const err = error ? error : displayError;
    const report = `
      code >>> ${err.code || displayError.code}
      message >>> ${err.message || displayError.message}
      user >>>  ${userEmail}
      method >>>  ${method}
      url >>>  ${originalUrl}
      error >>> ${JSON.stringify(error)}
      ip >>>  ${JSON.stringify(connection.remoteAddress)}
      params >>>  ${JSON.stringify(params)}
      query >>>  ${JSON.stringify(query)}
      body >>>  ${JSON.stringify(body)}
      =================================`;
    weblog(report);
    return res
      .status(displayError.code)
      .send({ code: displayError.code, message: displayError.message });
  } catch (e) {
    return console.error(e);
  }
}

export function error404(req, res) {
  const error = { code: 404, message: 'route not found' };
  return responsWithError(error, req, res);
}

export function error500(err, req, res) {
  const displayError = { code: 500, message: 'Internal server error' };
  return responsWithError(displayError, req, res, err);
}
