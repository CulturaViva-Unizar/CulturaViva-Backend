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

function handlePagination(_page, _limit, finalQuery = {}, orderCondition = {}, selectCondition) {
  const page = parseInt(_page) || 1;
  const limit = parseInt(_limit) || 10;
  const skip  = (page - 1) * limit;

  const aggregationPipeline = [
    { $match: finalQuery },
  ]

  if (orderCondition) {
    aggregationPipeline.push({ $sort: orderCondition });
  }

  aggregationPipeline.push(
    { $skip: skip },
    { $limit: limit }
  );

  aggregationPipeline.push(
    { $addFields: { id: "$_id" } },
  )

  aggregationPipeline.push(
    { $project: {
        _id: 0,
      } });
    
  if (selectCondition) {
    aggregationPipeline.push(
      { $project: selectCondition }
    );
  }

  return aggregationPipeline
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