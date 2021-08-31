import { OrderCancelledEvent, OrderStatus } from "@isticketing/common";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";

const setup = async () => {

    // Create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    // Save an Order
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: "azerty",
        price: 20,
        status: OrderStatus.Created
    });

    await order.save();

    // create a fake data event
    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: order.version + 1,
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
        }
    }

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, msg };
};

it('Update the order', async () => {

    // call the onMessage function with the data object + message object
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    // assertion to make sure a ticket was created
    const order = await Order.findById(data.id);

    expect(order).toBeDefined();
    expect(order!.status).toEqual(OrderStatus.Cancelled);
});

it('ack the message', async () => {

    // call the onMessage function with the data object + message object
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    // assertion to make sure the ACK was emmited
    expect(msg.ack).toHaveBeenCalled();

});