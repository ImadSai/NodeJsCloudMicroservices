import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketCreatedEvent } from "@isticketing/common";
import { Ticket } from '../../models/ticket';
import { queueGroupName } from "./queue-group-name";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {

    readonly subject = Subjects.TicketCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: TicketCreatedEvent['data'], msg: Message) {

        const { id, title, price } = data;

        // Build the new Ticket
        const ticket = Ticket.build({
            id,
            title,
            price
        });

        // Save the Ticket
        await ticket.save();

        // ACK message
        msg.ack();
    }
}