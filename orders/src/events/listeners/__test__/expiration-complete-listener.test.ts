import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import mongoose from 'mongoose';
import { Order, OrderStatus } from "../../../models/order";
import { ExpirationCompleteEvent } from "@isticketing/common";
import { Message } from "node-nats-streaming";

const setup = async () => {
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });

    await ticket.save();

    const order = Order.build({
        status: OrderStatus.Created,
        userId: 'azerty',
        expireAt: new Date(),
        ticket
    });

    await order.save();

    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
    };

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, order, ticket, data, msg };
};

it('updates the order status to cancelled', async () => {

    // call the onMessage function with the data object + message object
    const { listener, order, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emit an OrderCancelled event', async () => {

    // call the onMessage function with the data object + message object
    const { listener, order, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(eventData.id).toEqual(order.id);

});

it('acks the message', async () => {

    // call the onMessage function with the data object + message object
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    // assertion to make sure the ACK was emmited
    expect(msg.ack).toHaveBeenCalled();

});