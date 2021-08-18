import { useState } from 'react';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const signin = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { doRequest, errors } = useRequest({
        url: '/api/users/signin',
        method: 'post',
        body: {
            email, password
        },
        onSuccess: () => Router.push('/')
    });

    const onSubmit = async event => {
        event.preventDefault();
        await doRequest();
    };

    return (
        <form onSubmit={onSubmit}>
            <h1> Sign In </h1>

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
            <button type="submit" className="btn btn-primary">Signin</button>
        </form>
    );
};

export default signin;