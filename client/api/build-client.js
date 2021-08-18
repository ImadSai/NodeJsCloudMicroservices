import axios from 'axios';

/**
 * Create a Build Client to set the right Base URL and Headers if we are in the server side or client side
 */
const buildClient = ({ req }) => {

    // if we are in the server side
    if (typeof window === 'undefined') {
        return axios.create({
            baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            headers: req.headers
        });
    }

    // If we are in the client side
    else {
        return axios.create({
            baseURL: '/'
        });
    }
};

export default buildClient;