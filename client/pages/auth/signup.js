import { useState } from 'react';
import axios from 'axios';
import useRequest from '../../hooks/use-request';

const signup = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { doRequest, errors } = useRequest({
        url: '/api/users/signup',
        method: 'post',
        body: {
            email, password
        }
    });

    const onSubmit = async event => {
        event.preventDefault();
        doRequest();
    };

    return (
        <form onSubmit={onSubmit}>
            <h1> Sign Up </h1>

            {/* Email */}
            <div className="input-group input-group-sm mb-3">
                <span className="input-group-text" >Email</span>
                <input className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            {/* Password */}
            <div className="input-group input-group-sm mb-3">
                <span className="input-group-text" >Password</span>
                <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            {/* Errors */}
            {errors}

            {/* Signup Button */}
            <button type="submit" className="btn btn-primary">Signup</button>
        </form>
    );
};

export default signup;