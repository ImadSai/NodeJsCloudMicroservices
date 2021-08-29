import { Listener, NotFoundError, OrderCreatedEvent, OrderStatus, Subjects } from "@isticketing/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {

    readonly subject = Subjects.OrderCreated;

    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {

        const { id, ticket } = data;

        // Find the ticket
        const ticketSaved = await Ticket.findOne({
            _id: ticket.id
        });

        if (!ticketSaved) {
            throw new NotFoundError();
        }

        // Update the OrderID
        ticketSaved.set({
            orderId: id
        });

        // Update the ticket
        await ticketSaved.save();

        // Publish that the Ticket were updated
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticketSaved.id,
            price: ticketSaved.price,
            title: ticketSaved.title,
            userId: ticketSaved.userId,
            orderId: ticketSaved.orderId,
            version: ticketSaved.version
        });

        // ACK
        msg.ack();
    }
}