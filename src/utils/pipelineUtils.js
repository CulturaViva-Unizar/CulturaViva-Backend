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

    // Cálculo del número de comentarios si se ordena por 'comments'
    if (sort === 'comments') {
        aggregationPipeline.push({
            $addFields: {
                commentCount: { $size: { $ifNull: ['$comments', []] } }
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
        $project: { commentCount: 0, minPrice: 0, __v: 0 }
    });

    return aggregationPipeline;
}

module.exports = { buildAggregationPipeline };