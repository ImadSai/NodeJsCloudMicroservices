import Router from 'next/router';
import { useEffect } from 'react';
import useRequest from '../../hooks/use-request';

const signout = () => {

    const { doRequest } = useRequest({
        url: '/api/users/signout',
        method: 'post',
        body: {},
        onSuccess: () => Router.push('/')
    });

    // We use useEffect to execute the doRequest when the page is rendered
    useEffect(() => {
        doRequest();
    }, []);

    return <di>Signing you out...</di>
};

export default signout;