import { BadRequestError, currentUser, NotAuthorizedError, NotFoundError, OrderStatus, requireAuth, validateRequest } from "@isticketing/common";
import { body } from "express-validator";
import { Router, Request, Response } from 'express';
import { Order } from "../models/order";
import { stripe } from "../stripe";
import { Payment } from "../models/payment";
import { natsWrapper } from "../nats-wrapper";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";


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

    // Charge the user with stripe
    const charge = await stripe.charges.create({
        currency: 'eur',
        amount: order.price * 100,
        source: token
    });

    // Save the payment informations
    const payment = Payment.build({
        orderId: orderId,
        stripeId: charge.id
    });
    await payment.save();

    // Publish event saying that the order was created
    await new PaymentCreatedPublisher(natsWrapper.client).publish({
        id: payment.id,
        orderId: payment.orderId,
        stripeId: payment.stripeId
    });

    res.status(201).send({ id: payment.id });
});

export { router as newPaymentRouter };