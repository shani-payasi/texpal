// async function ko wrap karo - taaki try/catch har jagah likhna na pade
// agar error aaye toh automatically next() mein pass ho jaayega
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
