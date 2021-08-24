import { Publisher, Subjects, TicketUpdatedEvent } from "@isticketing/common";

/**  
 * Ticket Updated Publisher
 */
class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}

export { TicketUpdatedPublisher };