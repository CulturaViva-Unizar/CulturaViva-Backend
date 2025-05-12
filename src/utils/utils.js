const mongoose = require("mongoose");
const crypto = require("crypto");
const sanitizeHtml = require('sanitize-html');


/**
 * Convierte un valor a ObjectId de mongoose
 */
function toObjectId(id) {
  if (id instanceof mongoose.Types.ObjectId) return id;
  if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id)) return new mongoose.Types.ObjectId(id);
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

function escapeRegExp(str = '') {
  // Sustituye los caracteres especiales de las expresiones regulares
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createResponse(res, status, message, body = null) {
  return res.status(status).json({
    success: status >= 200 && status < 400,
    message: message,
    data: body
  });
}

function createOkResponse(res, message, body = null) {
  return createResponse(res, 200, message, body);
}

function createCreatedResponse(res, message, body = null) {
  return createResponse(res, 201, message, body);
}

function createBadRequestResponse(res, message, body = null) {
  return createResponse(res, 400, message, body);
}

function createUnauthorizedResponse(res, message, body = null) {
  return createResponse(res, 401, message, body);
}

function createNotFoundResponse(res, message, body = null) {
  return createResponse(res, 404, message, body);
}

function createForbiddenResponse(res, message, body = null) {
  return createResponse(res, 403, message, body);
}

function createConflictResponse(res, message, body = null) {
  return createResponse(res, 409, message, body);
}

function createInternalServerErrorResponse(res, message, body = null) {
  return createResponse(res, 500, message, body);
}

function cleanHtmltags(str){
  return sanitizeHtml(str, {
    allowedTags: [],
    allowedAttributes: {}
  });
}

async function handlePagination(query, filters, Model, additionalQuery = {}) {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 16;

  const finalQuery = { ...filters, ...additionalQuery };
  
  const totalItems = await Model.countDocuments(finalQuery);
  const items = await Model.find(finalQuery)
    .limit(limit)
    .skip((page - 1) * limit);

  return {
    items,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
    totalItems
  };
}

module.exports = {
  toObjectId,
  generateOID,
  escapeRegExp,
  createResponse,
  createConflictResponse,
  createOkResponse,
  createNotFoundResponse,
  createCreatedResponse,
  createBadRequestResponse,
  createUnauthorizedResponse,
  createForbiddenResponse,
  createInternalServerErrorResponse,
  cleanHtmltags,
  handlePagination
};