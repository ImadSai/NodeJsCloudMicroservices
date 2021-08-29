import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

const createTicket = (title: string, price: number, cookie: string[]) => {
    return request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: title,
            price: price
        })
        .expect(201);
};

it('it returns a 404 if the provided id does not exist', async () => {

    const ticketId = new mongoose.Types.ObjectId();
    const cookie = signin();
    const title = 'concert';
    const price = 20;

    await request(app)
        .put(`/api/tickets/${ticketId}`)
        .set('Cookie', cookie)
        .send({
            title,
            price
        })
        .expect(404);
});

it('it returns a 401 if the user is not authenticated', async () => {
    const ticketId = new mongoose.Types.ObjectId();
    const title = 'concert';
    const price = 20;

    await request(app)
        .put(`/api/tickets/${ticketId}`)
        .send({
            title,
            price
        })
        .expect(401);
});

it('it returns a 401 if the user does not own the ticket', async () => {
    const title = 'concert';
    const price = 20;

    const ticketSaved = await createTicket(title, price, signin());

    await request(app)
        .put(`/api/tickets/${ticketSaved.body.id}`)
        .set('Cookie', signin())
        .send({
            title: "Title Updated",
            price: 45
        })
        .expect(401);
});

it('it returns a 400 if the user provides an invalid title or price', async () => {
    const cookie = signin();
    const title = 'concert';
    const price = 20;

    const ticketSaved = await createTicket(title, price, cookie);

    await request(app)
        .put(`/api/tickets/${ticketSaved.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: "",
            price: 45
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${ticketSaved.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: "Concert",
            price: -45
        })
        .expect(400);
});

it('updates the ticket when provid valid inputs', async () => {
    const cookie = signin();
    const title = 'concert';
    const price = 20;

    const ticketSaved = await createTicket(title, price, cookie);

    const response = await request(app)
        .put(`/api/tickets/${ticketSaved.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: "concert",
            price: 45
        })
        .expect(200);

    expect(response.body.id).toEqual(ticketSaved.body.id);
    expect(response.body.price).toEqual(45);
});

it('publishes en event when a ticket is updated', async () => {
    const cookie = signin();
    const title = 'concert';
    const price = 20;

    const ticketSaved = await createTicket(title, price, cookie);

    const response = await request(app)
        .put(`/api/tickets/${ticketSaved.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: "concert",
            price: 45
        })
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('reject an update if the ticket is locked', async () => {

    const cookie = signin();
    const title = 'concert';
    const price = 20;

    const { body: ticketSaved } = await createTicket(title, price, cookie);

    // Set the OrderId
    ticketSaved.orderId = new mongoose.Types.ObjectId();

    // Update the Ticket in the DB
    const updateTicket = Ticket.build(ticketSaved);
    updateTicket.save();

    const response = await request(app)
        .put(`/api/tickets/${updateTicket.id}`)
        .set('Cookie', cookie)
        .send({
            title: "concert",
            price: 45
        })
        .expect(400);

});