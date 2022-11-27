import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true, removeAdditional: 'all' }); // options can be passed, e.g. {allErrors: true}
export function validate(schema, where) {
  /* eslint-disable-next-line consistent-return */
  return (req, res, next) => {
    const valid = ajv.validate(schema, req[where]);
    if (valid) {
      next();
    } else {
      console.error(ajv.errors);
      if (ajv.errors[0].message === 'should match pattern "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{7,}$"') {
        return res.status(400).json({ code: 400, message: 'password must contain at least 1 lowercase 1 uppercase 1 number and 1 sybol like #?!@$%^&*-' });
      }
      return res.status(400).json({ code: 400, message: ajv.errors[0].message });
    }
  };
}

export const a = Ajv;
