import request from 'supertest';
import { app } from '../../app';

it('fails when an email does not exist is supplied', async () => {
    const cookie = await signin();

    const response = await request(app)
        .post('/api/users/signout')
        .set('Cookie', cookie)
        .send({})
        .expect(200);

    expect(response.get('Set-Cookie')[0]).toEqual('express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly');
});