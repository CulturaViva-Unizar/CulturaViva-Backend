const mongoose = require("mongoose");

/**
 * Convierte un valor a ObjectId de mongoose
 */
function toObjectId(id) {
  if(id instanceof mongoose.Types.ObjectId) return id;
  if(typeof id === "string" && mongoose.Types.ObjectId.isValid(id)) return new mongoose.Types.ObjectId(id);
  throw new Error("Invalid ObjectId");
}

module.exports = { toObjectId };