module.exports = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    let rawData = '';

    req.on('data', chunk => {
      rawData += chunk;
    });

    req.on('end', () => {
      try {
        req.body = JSON.parse(rawData);
        next(); 
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON format', message: e.message });
      }
    });
  } else {
    next();
  }
};
