import { OrderCreatedEvent, OrderStatus } from "@isticketing/common";
import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

const setup = async () => {

    // Create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    // Create a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: 'rvfrf'
    });
    await ticket.save();

    // create a fake data event
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: new mongoose.Types.ObjectId().toHexString(),
        expireAt: '',
        status: OrderStatus.Created,
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    }

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, msg };
};

it('Update the ticket OrderId', async () => {

    // call the onMessage function with the data object + message object
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    // assertion to make sure a ticket was created
    const ticket = await Ticket.findById(data.ticket.id);

    expect(ticket).toBeDefined();
    expect(ticket!.orderId).toEqual(data.id);
});

it('ack the message', async () => {

    // call the onMessage function with the data object + message object
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    // assertion to make sure the ACK was emmited
    expect(msg.ack).toHaveBeenCalled();

});

it('publishes a ticket updated event', async () => {

    // call the onMessage function with the data object + message object
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    // assertion to make sure the ACK was emmited
    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const ticketUpdatesData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(data.id).toEqual(ticketUpdatesData.orderId);
});