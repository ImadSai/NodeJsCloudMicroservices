import { BadRequestError, currentUser, NotAuthorizedError, NotFoundError, OrderStatus, requireAuth, validateRequest } from "@isticketing/common";
import { body } from "express-validator";
import { Router, Request, Response } from 'express';
import { Order } from "../models/order";
import { stripe } from "../stripe";


const router = Router();

router.post('/api/payments', requireAuth, [
    body('token').not().isEmpty().withMessage('token most be provided'),
    body('orderId').not().isEmpty().withMessage('orderId must be provided')
], validateRequest, async (req: Request, res: Response) => {

    const { token, orderId } = req.body;

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
        throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
        throw new BadRequestError("Order is cancelled");
    }

    // charge the user with stripe
    await stripe.charges.create({
        currency: 'usd',
        amount: order.price * 100,
        source: token
    })

    res.send({ sucess: true });

});

export { router as newPaymentRouter };