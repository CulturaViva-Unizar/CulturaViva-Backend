const eventController = require('./itemController');
const { Item, Event, Place } = require('../models/eventModel');
const { Comment, Valoration, Response } = require('../models/commentModel');
const { toObjectId, 
        generateOID,
        createOkResponse,
        createNotFoundResponse,
        createBadRequestResponse,
        createCreatedResponse,
        createForbiddenResponse
    } = require('../utils/utils');
const { User } = require('../models/userModel');
const { buildAggregationPipeline } = require('../utils/pipelineUtils');


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
        if (name) filters.title = name;
        if (category) filters.category = category;
    
        if (startDate) {
            filters.startDate = {};
            filters.startDate.$gte = new Date(startDate);
        }

        if (endDate) {
            filters.endDate = {};
            filters.endDate.$lte = new Date(endDate);
        }

        const aggregationPipeline = buildAggregationPipeline(filters, {
            sort,
            order,
            minPrice,
            maxPrice,
            page,
            limit
        });

        // Ejecución de la agregación
        const items = await (type === 'Event' ? Event : Place).aggregate(aggregationPipeline);

        // Cálculo del total de ítems
        const totalItems = await (type === 'Event' ? Event : Place).countDocuments(filters);

        return createOkResponse(res, "Items obtenidos correctamente", {
            items,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            totalItems
        });
    }
    /**
     * Obtiene un ítem (evento o lugar) por su ID
     */
    async getItemById(req, res) {
        const type = req.query.type || 'Event';
        const eventId = toObjectId(req.params.id);
        console.log('ID del evento:', eventId);
        const event = await Item.findOne({ _id: eventId, itemType: type });
        if (!event) {
            return createNotFoundResponse(res, "Item no encontrado");
        }
        return createOkResponse(res, "Item obtenido con éxito", event);
    }

    async guardarEventos(eventos) {
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
    }

    async guardarLugares(lugares) {
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
    }

    async getItemComments(req, res) {
        const type = req.query.type || 'Event';
        const eventId = toObjectId(req.params.id);
        console.log('ID del evento:', eventId);
        const event = await Item.findOne({ _id: eventId, itemType: type }).populate('comments');
        if (!event) {
            return createNotFoundResponse(res, "Item no encontrado");
        }
        return createOkResponse(res, "Comentarios obtenidos con éxito", event.comments);
    }

    async createComment(req, res) {
        const userId = req.userId;
        const { text, value } = req.body;
        const responseTo = req.params.commentId;
    
        if (value != null && responseTo != null) {
            return createBadRequestResponse(res, "No puedes crear un comentario y una valoración al mismo tiempo");
        }
    
        const type = value != null ? 'Valoration' : responseTo != null ? 'Response' : 'Comment';
    
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

        return createCreatedResponse(res, "Comentario creado exitosamente", comment);
    }

    async getResponses(req, res) {
        const responses = await Response.find(
            { 
                responseTo: req.params.commentId, 
                event: req.params.id 
            }
        ).populate('user', 'name').populate('responseTo', 'text');
        
        return createOkResponse(res, "Respuestas obtenidas exitosamente", responses);
    }

    async deleteComment(req, res) {
        const { id, commentId } = req.params;

        // Verifica si el comentario existe
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return createNotFoundResponse(res, "Comentario no encontrado");
        }

        // Verifica si el usuario es el propietario del comentario o es admin
        const user = await User.findById(req.userId)
        if (comment.user.toString() !== req.userId.toString() && !user.admin) {
            return createForbiddenResponse(res, "No tienes permiso para eliminar este comentario");
        }

        // Verifica si el evento existe
        const event = await Item.findById(id);
        if (!event) {
            return createNotFoundResponse(res, "Evento no encontrado");
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



        return createOkResponse(res, "Comentario eliminado exitosamente");
    }
}

module.exports = new ItemController(); 