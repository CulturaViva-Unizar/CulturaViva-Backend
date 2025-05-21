/**
 * Construye el pipeline de agregación para filtrar, ordenar y paginar ítems.
 * @param {Object} filters - Filtros básicos para el pipeline.
 * @param {Object} options - Opciones adicionales como sort, order, minPrice, maxPrice, page y limit.
 * @returns {Array} Pipeline de agregación para MongoDB.
 */
function buildAggregationPipeline(filters, options) {
    const { sort, order, minPrice, maxPrice, page, limit } = options;
    const sortOrder = order === 'desc' ? -1 : 1;

    const aggregationPipeline = [
        { $match: filters }, // Aplica los filtros básicos
    ];

    aggregationPipeline.push({ $addFields: { id: "$_id" } });

    // Cálculo del número de comentarios si se ordena por 'comments'
    if (sort === 'comments') {
        aggregationPipeline.push({
            $lookup: {
                from: 'comments',
                localField: 'comments',
                foreignField: '_id',
                as: 'commentDocs'
            }
        });
        
        aggregationPipeline.push({
            $addFields: {
                commentCount: {
                    $size: {
                        $filter: {
                            input: '$commentDocs',
                            as: 'comment',
                            cond: { $eq: ['$$comment.deleted', false] }
                        }
                    }
                }
            }
        });
    }

    // Cálculo del precio mínimo si se filtra por precio
    if (minPrice || maxPrice) {
        aggregationPipeline.push({
            $addFields: {
                minPrice: {
                    $min: {
                        $map: {
                            input: '$price',
                            as: 'p',
                            in: {
                                $cond: {
                                    if: { $eq: ['$$p.precio', null] },
                                    then: 0,
                                    else: '$$p.precio'
                                }
                            }
                        }
                    }
                }
            }
        });

        const priceFilters = [];
        if (minPrice) {
            priceFilters.push({ $gte: ['$minPrice', parseFloat(minPrice)] });
        }
        if (maxPrice) {
            priceFilters.push({ $lte: ['$minPrice', parseFloat(maxPrice)] });
        }

        if (priceFilters.length > 0) {
            aggregationPipeline.push({
                $match: { $expr: { $and: priceFilters } }
            });
        }
    }

    // Ordenamiento
    if (sort) {
        aggregationPipeline.push({ $sort: { [sort === 'comments' ? 'commentCount' : sort]: sortOrder } });
    }

    // Paginación
    aggregationPipeline.push(
        { $skip: (page - 1) * limit },
        { $limit: limit }
    );

    // Exclusión de campos no deseados
    aggregationPipeline.push({
        $project: { commentCount: 0, minPrice: 0, __v: 0, _id: 0 }
    });

    return aggregationPipeline;
}

/**
 * Construye pipeline para paginar usuarios ordenando por cualquier campo,
 * incluyendo un campo calculado commentCount.
 */
function buildUserAggregationPipeline(filters, { sortField, order = 'desc', page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    const sortOrder = order.toLowerCase() === 'asc' ? 1 : -1;

    const sortObj = { [sortField]: sortOrder };
    if (!('_id' in sortObj)) {
        sortObj._id = 1;
    }

    return [
        { $match: filters },

        {
            $lookup: {
                from: 'comments',
                localField: 'comments',
                foreignField: '_id',
                as: 'commentDocs'
            }
        },

        {
            $addFields: {
                id: "$_id",
                commentCount: { $size: '$comments' },
                commentCountEnabled: {
                    $size: {
                        $filter: {
                            input: '$commentDocs',
                            as: 'c',
                            cond: { $eq: ['$$c.deleted', false] }
                        }
                    }
                },
                commentCountDisabled: {
                    $size: {
                        $filter: {
                            input: '$commentDocs',
                            as: 'c',
                            cond: { $eq: ['$$c.deleted', true] }
                        }
                    }
                }
            }
        },

        { $sort: sortObj },
        { $skip: skip },
        { $limit: limit },

        { $project: { password: 0, __v: 0, commentDocs: 0, _id: 0, comments: 0 } }
    ];
}


module.exports = { buildAggregationPipeline, buildUserAggregationPipeline };