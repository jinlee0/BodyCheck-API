const jwt = require('jsonwebtoken');

let middlewares = {};

// utils
middlewares.getSuccess = (data) => {
  return {
    success: true,
    message: null,
    data
  }
}

middlewares.getFailure = (message) => {
  if (!message) {
    message = 'data not found';
  }
  return {
    success: false,
    message,
    data: null
  }
}

middlewares.updateForEach = async (record, fields) => {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  let obj = new Object();
  let isSame = true;
  for(let i = 0; i < keys.length; i++){
    if(values[i]){
      if(values[i] != record.getDataValue(keys[i])){
        isSame = false;
        obj[keys[i]] = values[i];
      }
    }
  }
  if(!isSame){
    await record.update(obj);
  }
  return isSame;
}


// middlewares
middlewares.isLoggedIn = (req, res, next) => {
  const token = req.headers['bodycheck-access-token'];
  if (!token) {
    return res.status(401).json(middlewares.getFailure('token is required'));
  }
  else {
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        return res.status(401).json(middlewares.getFailure('token is expired'));
      }
      else {
        req.decoded = decoded;
        next();
      }
    })
  }
};

middlewares.getNoSuchResource = (name, where) => {
  return {
    message: `no ${name}`,
    detail: {
      resource: name,
      where: where,
    }
  }
}

middlewares.getValidationError = (params) => {
  let validationError = {
    name: 'ValidationError',
    errors: {},
  };
  let isValid = true;
  let paramNames = Object.keys(params);
  let paramValues = Object.values(params);

  for (let i = 0; i < paramNames.length; i++) {
    if (!paramValues[i]) {
      isValid = false;
      validationError.errors[paramNames[i]] = {
        message: `${paramNames[i]} is required`,
        value: paramValues[i],
      }
    }
  }

  return (isValid) ? null : validationError;
}
module.exports = middlewares;