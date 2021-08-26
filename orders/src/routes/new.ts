import mongoose from 'mongoose';
import express, { Request, Response } from "express";
import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from "@isticketing/common";
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post('/api/orders', requireAuth, [
    body('ticketId')
        .notEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('Ticket Id must be provided')
], validateRequest, async (req: Request, res: Response) => {

    const { ticketId } = req.body;

    // Find the ticket the user is trying to order in the DB
    const ticket = await Ticket.findById(ticketId)
    if (!ticket) {
        throw new NotFoundError();
    }

    // Make sure that the ticket is not already reserved in another orther
    const isReserved = await ticket.isReserved();
    if (isReserved) {
        throw new BadRequestError('Ticket is already reserved');
    }

    // Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order and save it to the DB
    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expireAt: expiration,
        ticket
    });

    await order.save();

    // Publish event saying that the order was created

    res.status(201).send(order);
});

export { router as createOrdersRouter }