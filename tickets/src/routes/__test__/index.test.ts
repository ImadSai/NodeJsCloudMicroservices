import request from 'supertest';
import { app } from '../../app';

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

it('fetches a list of tickets', async () => {

    const cookie = signin();

    await createTicket("Gad Elmaleh", 50, cookie);
    await createTicket("Jamel Debbouze", 50, cookie);

    const ticketsList = await request(app)
        .get('/api/tickets')
        .send()
        .expect(200);

    expect(ticketsList.body.length).toEqual(2);
});