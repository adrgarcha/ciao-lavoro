import { fetchBackend } from "../utils/backendApi";

export const loginRequest = async (username, password) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    };

    try {
        const response = await fetchBackend(`/user/login/`, options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Login error:', error);
    }
};

export const registerRequest = async (username, password, firstName, lastName, email, image, birthdate, language) => {

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('email', email);
    formData.append('image', image);
    formData.append('birthdate', birthdate);
    formData.append('language', language);

    const options = {
        method: 'POST',
        body: formData
    };

    return fetchBackend(`/user/register/`, options);
};
