/**
 * Validates user session
 * @param {*} req 
 * @param {*} res 
 */
export const SessionChecker = async (req, res, app) => {
  if (req.raw.method === 'OPTIONS') return true;

  const { authorization } = req.headers;

  try {
    let _protected = null;
    if (req.context?.schema?.properties?.protected?.method)
      _protected = req.context.schema.properties.protected;

    if (_protected) {
      if (!authorization) {
        res.code(401).send('Unauthorized');
        return;
      }
      switch (_protected.method) {
        case 'jwt':
          return true;
        default:
          return false;
      }
    }
  } catch (err) {
    res.code(401).send(err);
    throw err;
  }
}