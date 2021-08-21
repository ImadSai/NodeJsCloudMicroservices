import mongoose from 'mongoose';

// An Interface that describes the properties
// that are required to create a new User 
interface ticketInterface {
    title: string;
    price: number;
    userId: string;
}

// An Interface that describes the properties
// that a User Model has 
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: ticketInterface): TicketDoc;
}

// An Interface that describes the properties
// that a User Document has 
interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    userId: string;
    // createdAt: string;
    // updatedAt: string;
}

// Defining the Schema
const ticketSchema = new mongoose.Schema<TicketDoc>({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

// Defining the Build Function
ticketSchema.statics.build = (attrs: ticketInterface) => {
    return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };