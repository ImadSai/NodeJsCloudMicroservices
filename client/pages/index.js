import buildClient from '../api/build-client';

const index = ({ currentUser }) => {
    return (currentUser === null ? <h1> You are not Signed in </h1> : <h1> You are Signed in </h1>);
}

index.getInitialProps = async (context) => {
    const client = buildClient(context);
    const { data } = await client.get('/api/users/currentuser');
    return data;
};

export default index;