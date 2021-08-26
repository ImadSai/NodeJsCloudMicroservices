import { NotFoundError, requireAuth } from "@isticketing/common";
import express, { Request, Response } from "express";
import { Order } from "../models/order";

const router = express.Router();

router.get('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {

    const orderId = req.params.orderId;

    const order = await Order.findOne({
        _id: orderId,
        userId: req.currentUser!.id
    }).populate('ticket');

    if (!order) {
        throw new NotFoundError();
    }

    res.status(200).send(order);
});

export { router as showOrdersRouter }