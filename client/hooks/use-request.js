import axios from 'axios';
import { useState } from 'react';

/**
 * Create Use Request Hook
 */
const useRequest = ({ url, method, body, onSuccess }) => {
    const [errors, setErrors] = useState(null);

    const doRequest = async () => {
        try {
            setErrors(null);
            const response = await axios[method](url, body);

            // If we defined a onSucess function we execute it with the data in the response
            if (onSuccess) {
                onSuccess(response.data);
            }

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