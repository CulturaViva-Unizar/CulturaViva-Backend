const mongoose = require("mongoose");
const crypto = require("crypto");

/**
 * Convierte un valor a ObjectId de mongoose
 */
function toObjectId(id) {
  if(id instanceof mongoose.Types.ObjectId) return id;
  if(typeof id === "string" && mongoose.Types.ObjectId.isValid(id)) return new mongoose.Types.ObjectId(id);
  throw new Error("Invalid ObjectId");
}

/**
 * Dado un id de api, genera un ObjectId de mongoose.
 */
function generateOID(apiId) {
  const hash = crypto.createHash('md5').update(apiId).digest('hex');
  const objectIdHex = hash.slice(0, 24);
  return new mongoose.Types.ObjectId(objectIdHex);
}

module.exports = { toObjectId, generateOID };