const eventController = require('./itemController');
const { Item, Event, Place } = require('../models/eventModel');
const { Comment, Valoration, Response } = require('../models/commentModel');
const { toObjectId, generateOID } = require('../utils/utils');
const { User } = require('../models/userModel');


class ItemController {

    /**
     * Obtiene todos los ítems (eventos o lugares)
     */
    async getItems(req, res) {
        const { name, startDate, endDate, category, sort, order, minPrice, maxPrice } = req.query;
    
        const type = req.query.type || 'Event';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 16;
    
        const filters = {};
        if (name) filters.name = name;
        if (category) filters.category = category;
    
        // Manejo de fechas
        if (startDate || endDate) {
            filters.date = {};
            if (startDate) filters.date.$gte = new Date(startDate);
            if (endDate) filters.date.$lte = new Date(endDate);
        }
    
        try {
            const sortOrder = order === 'desc' ? -1 : 1;
    
            const aggregationPipeline = [
                { $match: filters },
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
    
            // Ejecución de la agregación
            const items = await (type === 'Event' ? Event : Place).aggregate(aggregationPipeline);
    
            // Cálculo del total de ítems
            const totalItems = await (type === 'Event' ? Event : Place).countDocuments(filters);
    
            return res.status(200).json({
                success: true,
                message: "Items obtenidos correctamente",
                data: {
                    items,
                    currentPage: page,
                    totalPages: Math.ceil(totalItems / limit),
                    totalItems
                }
            });
        } catch (error) {
            console.error('Error al obtener ítems:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener ítems',
                data: error
            });
        }
    }
    /**
     * Obtiene un ítem (evento o lugar) por su ID
     */
    async getItemById(req, res) {
        const type = req.query.type || 'Event';
        try {
            const eventId = toObjectId(req.params.id);
            console.log('ID del evento:', eventId);
            const event = await Item.findOne({ _id: eventId, itemType: type });
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found' 
                });
            }
            return res.status(200).json({
                success: true,
                message: "Item obtenido con exito",
                data: event
            });
        } catch (error) {
            return res.status(500).json({ 
                success: false,
                message: 'Error fetching event', 
                data: error 
            });
        }
    }

    async guardarEventos(eventos) {
      try {
        // La API falla (es posible: la llevan -vagos- funcionarios) y no devuelve nada
        if (eventos.length <= 0) return; 
        for (const evento of eventos) {
          evento._id = generateOID(String(evento.id));
          await Event.updateOne(
            { _id: evento._id },
            { $set: evento },
            { upsert: true }
          );
        }
      } catch (error) {
        console.error('Error al guardar eventos:', error);
        throw new Error('No se pudieron guardar los eventos');
      }
    }

    async guardarLugares(lugares) {
        try {
            // La API falla (es posible: la llevan -vagos- funcionarios) y no devuelve nada
            if (lugares.length <= 0) return; 
            for (const lugar of lugares) {
            lugar._id = generateOID(String(lugar.id));
            await Place.updateOne(
                { _id: lugar._id },
                { $set: lugar },
                { upsert: true }
            );
            }
        } catch (error) {
            console.error('Error al guardar lugares:', error);
            throw new Error('No se pudieron guardar los lugares');
        }
    }

    async getItemComments(req, res) {
        const type = req.query.type || 'Event';
        try {
            const eventId = toObjectId(req.params.id);
            console.log('ID del evento:', eventId);
            const event = await Item.findOne({ _id: eventId, itemType: type }).populate('comments');
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found' 
                });
            }
            return res.status(200).json({
                success: true,
                message: "Item obtenido con exito",
                data: event.comments
            });
        } catch (error) {
            return res.status(500).json({ 
                success: false,
                message: 'Error fetching event', 
                data: error 
            });
        }
    }

    async createComment(req, res) {
        const userId = req.userId;
        const { text, value } = req.body;
        const responseTo = req.params.commentId;
    
        if (value != null && responseTo != null) {
            return res.status(400).json({
                success: false,
                message: 'Formato incorrecto. Solo se permite un tipo de comentario'
            });
        }
    
        const type = value != null ? 'Valoration' : responseTo != null ? 'Response' : 'Comment';
    
        try {
            const commentData = {
                text,
                user: userId,
                event: req.params.id
            };
    
            let comment;
    
            if (type === 'Valoration') {
                comment = await Valoration.create({ ...commentData, value });
            } else if (type === 'Response') {
                comment = await Response.create({ ...commentData, responseTo });
            } else {
                comment = await Comment.create(commentData);
            }
            await Item.findByIdAndUpdate(
                req.params.id,
                { $push: { comments: comment._id } },
                { new: true }
            );
    
            return res.status(201).json({
                success: true,
                message: 'Comentario creado exitosamente',
                data: comment
            });
        } catch (error) {
            console.error('Error al crear el comentario:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al crear el comentario',
                data: error
            });
        }
    }

    async getResponses(req, res) {
        try {
            const responses = await Response.find(
                { 
                 responseTo: req.params.commentId, 
                 event: req.params.id 
                }
            ).populate('user', 'name').populate('responseTo', 'text');
            
            return res.status(200).json({
                success: true,
                message: 'Respuestas obtenidas exitosamente',
                data: responses
            });
        } catch (error) {
            console.error('Error al obtener las respuestas:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener las respuestas',
                data: error
            });
        }
    }

    async deleteComment(req, res) {
        try {
            const { id, commentId } = req.params;
    
            // Verifica si el comentario existe
            const comment = await Comment.findById(commentId);
            if (!comment) {
                return res.status(404).json({
                    success: false,
                    message: 'Comentario no encontrado'
                });
            }

            // Verifica si el usuario es el propietario del comentario o es admin
            const user = await User.findById(req.userId)
            if (comment.user.toString() !== req.userId.toString() && !user.admin) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para eliminar este comentario'
                });
            }
    
            // Verifica si el evento existe
            const event = await Item.findById(id);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Evento no encontrado'
                });
            }
    
            // Elimina el comentario
            await Comment.findByIdAndDelete(commentId);
    
            // Elimina el ID del comentario de la lista de comentarios del evento
            await Item.findByIdAndUpdate(
                id,
                { $pull: { comments: commentId } },
                { new: true }
            );

            // Elimina el ID del comentario de la lista de comentarios del usuario
            await User.findByIdAndUpdate(
                req.userId,
                { $pull: { comments: commentId } },
                { new: true }
            );

            await Response.deleteMany({ responseTo: commentId });


    
            return res.status(200).json({
                success: true,
                message: 'Comentario eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar el comentario:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar el comentario',
                data: error
            });
        }
    }
}

module.exports = new ItemController(); 