import { NotFoundError, OrderStatus, requireAuth } from "@isticketing/common";
import express, { Request, Response } from "express";
import { OrderCancelledPublisher } from "../events/publisher/order-cancelled-publisher";
import { Order } from "../models/order";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.delete('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {

    const orderId = req.params.orderId;

    const order = await Order.findOne({
        _id: orderId,
        userId: req.currentUser!.id
    }).populate('ticket');

    if (!order) {
        throw new NotFoundError();
    }

    // Update Status
    order.status = OrderStatus.Cancelled;

    await order.save();

    // Publish event saying that the order was cancelled
    new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        ticket: {
            id: order.ticket.id
        }
    });

    res.status(204).send(order);
});

export { router as deleteOrdersRouter }