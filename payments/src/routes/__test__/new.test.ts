import { Order, OrderStatus } from "../../models/order";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { stripe } from "../../stripe";

it('returns a 404 when order not found order', async () => {

    await request(app)
        .post('/api/payments')
        .set('Cookie', signin())
        .send({
            orderId: new mongoose.Types.ObjectId().toHexString(),
            token: "azert"
        })
        .expect(404);
});

it('returns a 401 when the user doesnt match', async () => {

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 20,
        userId: "azerty",
        version: 0
    });

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', signin())
        .send({
            orderId: order.id,
            token: "azerty"
        })
        .expect(401);
});

it('returns a 400 when an order is cancelled', async () => {

    const userId = new mongoose.Types.ObjectId('azertyuiopml').toHexString();
    const cookie = signin(userId);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Cancelled,
        price: 20,
        userId: userId,
        version: 0
    });

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({
            orderId: order.id,
            token: "azerty"
        })
        .expect(400);

});

it('return a 201 when a payment is successfull', async () => {

    const userId = new mongoose.Types.ObjectId('azertyuiopml').toHexString();
    const cookie = signin(userId);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 20,
        userId: userId,
        version: 0
    });

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', cookie)
        .send({
            orderId: order.id,
            token: "azerty"
        })
        .expect(201);

    const paymentData = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    expect(order.price * 100).toEqual(paymentData.amount);
});