import { TicketUpdatedEvent } from "@isticketing/common";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

const setup = async () => {

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'consert',
        price: 20
    });

    await ticket.save();

    // Create an instance of the listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // create a fake data event
    const data: TicketUpdatedEvent['data'] = {
        version: 1,
        id: ticket.id,
        userId: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 25
    }

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, msg };
};

it('update a ticket', async () => {

    // call the onMessage function with the data object + message object
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    // assertion to make sure a ticket was created
    const ticket = await Ticket.findById(data.id);
    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(25);
    expect(ticket!.version).toEqual(1);
});

it('acks the message', async () => {

    // call the onMessage function with the data object + message object
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    // assertion to make sure the ACK was emmited
    expect(msg.ack).toHaveBeenCalled();

});

it('does not call the ack if the event has a skipped version number', async () => {

    // call the onMessage function with the data object + message object
    const { listener, data, msg } = await setup();

    data.version = 3;

    try {
        await listener.onMessage(data, msg);
    } catch (err) { }

    // assertion to make sure the ACK was emmited
    expect(msg.ack).not.toHaveBeenCalled();
});

