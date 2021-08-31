import { OrderCreatedEvent, OrderStatus } from "@isticketing/common";
import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";

const setup = async () => {

    // Create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    // create a fake data event
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: new mongoose.Types.ObjectId().toHexString(),
        expireAt: '',
        status: OrderStatus.Created,
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
            price: 20
        }
    }

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, msg };
};

it('create the order', async () => {

    // call the onMessage function with the data object + message object
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    // assertion to make sure an order was created
    const order = await Order.findById(data.id);

    expect(order).toBeDefined();
    expect(order!.price).toEqual(data.ticket.price);
});

it('ack the message', async () => {

    // call the onMessage function with the data object + message object
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    // assertion to make sure the ACK was emmited
    expect(msg.ack).toHaveBeenCalled();

});