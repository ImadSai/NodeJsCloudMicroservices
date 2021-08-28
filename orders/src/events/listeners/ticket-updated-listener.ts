import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketUpdatedEvent, NotFoundError } from "@isticketing/common";
import { Ticket } from '../../models/ticket';
import { queueGroupName } from "./queue-group-name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {

    readonly subject = Subjects.TicketUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {

        const { id, title, price, version } = data;

        // Find a Ticket in the DB 
        const ticket = await Ticket.findByEvent({ id, version });

        if (!ticket) {
            throw new NotFoundError();
        }

        // Update fields
        ticket.set({
            title,
            price,
            version
        });

        // Save
        await ticket.save();

        // ACK message
        msg.ack();
    }
}