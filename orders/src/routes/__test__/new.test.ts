import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

it('returns an error if the ticket does not exists', async () => {
    const ticketId = new mongoose.Types.ObjectId();

    await request(app)
        .post('/api/orders')
        .set('Cookie', signin())
        .send({ ticketId })
        .expect(404);
});

it('return an error if the ticket is already reserved', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toString(),
        title: 'concert',
        price: 20
    });

    await ticket.save();

    const order = Order.build({
        ticket,
        userId: 'user123456',
        status: OrderStatus.Created,
        expireAt: new Date()
    });

    await order.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', signin())
        .send({ ticketId: ticket.id })
        .expect(400);
});

it('reserves a ticket', async () => {

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toString(),
        title: 'concert',
        price: 20
    });

    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', signin())
        .send({ ticketId: ticket.id })
        .expect(201);
});

it('publishes en event when an order is created', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toString(),
        title: 'concert',
        price: 20
    });

    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', signin())
        .send({ ticketId: ticket.id })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});