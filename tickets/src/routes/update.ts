import { NotAuthorizedError, NotFoundError, requireAuth, validateRequest } from '@isticketing/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';

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

    // Update the ticket
    ticket.set({
        title: title,
        price: price
    });

    const updatedTicket = await ticket.save();

    res.status(200).send(updatedTicket);
});

export { router as updateTicketRouter };