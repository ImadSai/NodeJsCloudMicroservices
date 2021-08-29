import { BadRequestError, NotAuthorizedError, NotFoundError, requireAuth, validateRequest } from '@isticketing/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put('/api/tickets/:id', requireAuth, [
    body('title').not().isEmpty().withMessage('Title must be valid'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be provided greater than 0'),
], validateRequest, async (req: Request, res: Response) => {

    const ticketId = req.params.id;
    const { title, price } = req.body;

    const ticket = await Ticket.findById(ticketId);

    // Check if the Ticket exists
    if (!ticket) {
        throw new NotFoundError();
    }

    // Check if the Ticket is updated by the Owner
    if (ticket.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    // If the ticket is locked (Reserved) we throw an error
    if (ticket.orderId) {
        throw new BadRequestError('Cannot edit a reserved ticket');
    }

    // Update the ticket
    ticket.set({
        title: title,
        price: price
    });

    const updatedTicket = await ticket.save();

    // Publish event Ticket Updated
    await new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: updatedTicket.id,
        title: updatedTicket.title,
        price: updatedTicket.price,
        userId: updatedTicket.userId,
        version: ticket.version
    });

    res.status(200).send(updatedTicket);
});

export { router as updateTicketRouter };