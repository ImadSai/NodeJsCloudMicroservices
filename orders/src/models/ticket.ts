import mongoose from 'mongoose';
import { Order, OrderStatus } from './order';

// An Interface that describes the properties
// that are required to create a new User 
interface ticketInterface {
    id: string;
    title: string;
    price: number;
}

// An Interface that describes the properties
// that a User Document has 
export interface TicketDoc extends mongoose.Document {
    id: string;
    title: string;
    price: number;
    version: number;
    isReserved(): Promise<Boolean>;
}

// An Interface that describes the properties
// that a User Model has 
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: ticketInterface): TicketDoc;
    findByEvent(event: { id: string, version: number }): Promise<TicketDoc | null>;
}

// Defining the Schema
const ticketSchema = new mongoose.Schema<TicketDoc>({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

// Set Version Key
ticketSchema.set('versionKey', 'version');
ticketSchema.pre('save', function (done) {
    this.$where = {
        version: this.get('version') - 1
    }
    done();
});

// Defining the Build Function
ticketSchema.statics.build = (attrs: ticketInterface) => {
    return new Ticket({
        _id: attrs.id,
        title: attrs.title,
        price: attrs.price
    });
};

// Defining the find by event
ticketSchema.statics.findByEvent = (event: { id: string, version: number }) => {
    return Ticket.findOne({
        _id: event.id,
        version: event.version - 1
    });
};

ticketSchema.methods.isReserved = async function (): Promise<Boolean> {
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaintingPayment,
                OrderStatus.Complete,
            ]
        }
    });
    return (existingOrder != null);
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };