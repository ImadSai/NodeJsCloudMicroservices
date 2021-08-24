import { Publisher, Subjects, TicketCreatedEvent } from "@isticketing/common";

/**  
 * Ticket Created Publisher
 */
class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}

export { TicketCreatedPublisher };