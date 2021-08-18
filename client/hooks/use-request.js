import axios from 'axios';
import { useState } from 'react';

/**
 * Create Use Request Hook
 */
const useRequest = ({ url, method, body }) => {
    const [errors, setErrors] = useState(null);

    const doRequest = async () => {
        try {
            setErrors(null);
            const response = await axios[method](url, body);
            return response.data;
        } catch (err) {
            setErrors(
                <div className="alert alert-danger">
                    <h6>Ooops...</h6>
                    <ul className="my-0">
                        {err.response.data.errors.map(err => (<li key={err.message}> {err.message} </li>))}
                    </ul>

                </div>
            );
        }
    };

    return { doRequest, errors };
}

export default useRequest;