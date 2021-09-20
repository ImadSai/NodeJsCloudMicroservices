import { requireAuth, validateRequest } from '@isticketing/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';


const router = express.Router();

router.post('/api/tickets', requireAuth, [
    body('title').not().isEmpty().withMessage('Title must be valid'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
], validateRequest, async (req: Request, res: Response) => {

    // Get Title and price
    const { title, price } = req.body;

    const ticket = Ticket.build({
        title,
        price,
        userId: req.currentUser!.id
    });

    const ticketSaved = await ticket.save();

    // Publish event Ticket Created
    await new TicketCreatedPublisher(natsWrapper.client).publish({
        id: ticketSaved.id,
        title: ticketSaved.title,
        price: ticketSaved.price,
        userId: ticketSaved.userId,
        version: ticket.version
    });

    // Log informations 
    logger.info(`Ticket Created`, { "ticketId": ticketSaved.id, "userId": ticketSaved.userId });

    res.status(201).send(ticketSaved);
});

export { router as createTicketRouter };