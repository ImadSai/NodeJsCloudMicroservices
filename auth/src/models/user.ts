import mongoose from 'mongoose';
import { Password } from '../services/password';

// An Interface that describes the properties
// that are required to create a new User 
interface userInterface {
    email: string;
    password: string;
}

// An Interface that describes the properties
// that a User Model has 
interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: userInterface): UserDoc;
}

// An Interface that describes the properties
// that a User Document has 
interface UserDoc extends mongoose.Document {
    email: string;
    password: string;
    // createdAt: string;
    // updatedAt: string;
}

// Defining the Schema
const userSchema = new mongoose.Schema<UserDoc>({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
            delete ret.__v;
        }
    }
});

// Hash password when User is created or password modified
userSchema.pre('save', async function (done) {
    if (this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed)
    }
    done();
});

// Defining the Build Function
userSchema.statics.build = (attrs: userInterface) => {
    return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };