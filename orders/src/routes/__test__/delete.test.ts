import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('delete a specific order', async () => {

    const cookie = signin();

    const ticket = Ticket.build({
        title: 'concert',
        price: 20
    });

    await ticket.save();

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({
            ticketId: ticket.id
        })
        .expect(201);

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', cookie)
        .send()
        .expect(204);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('publishes en event when an order is cancelled', async () => {
    const cookie = signin();

    const ticket = Ticket.build({
        title: 'concert',
        price: 20
    });

    await ticket.save();

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({
            ticketId: ticket.id
        })
        .expect(201);

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', cookie)
        .send()
        .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});