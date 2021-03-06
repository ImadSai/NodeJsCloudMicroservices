import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

it('show a specific order', async () => {

    const cookie = signin();

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toString(),
        title: 'concert',
        price: 20
    });

    await ticket.save();

    const { body: orderSaved } = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({
            ticketId: ticket.id
        })
        .expect(201);

    const { body: orderFound } = await request(app)
        .get(`/api/orders/${orderSaved.id}`)
        .set('Cookie', cookie)
        .send()
        .expect(200);

    expect(orderFound.id).toEqual(orderSaved.id);
    expect(orderFound.ticket.id).toEqual(orderSaved.ticket.id);
});