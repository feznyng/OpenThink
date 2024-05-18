import axios from 'axios';
import { 
    baseURL
} from './index';

export const googleSignIn = (googleUser) => async dispatch => {
    try {
        const id_token = googleUser.getAuthResponse().id_token;
        const profile = googleUser.getBasicProfile();
        const response = await axios.post(
            baseURL + 'login/google',
            {
                google_id: profile.getId(),
                firstname: profile.getGivenName(),
                lastname: profile.getFamilyName(),
                profilepic: profile.getImageUrl(),
                email: profile.getEmail(),
                id_token
            },
            { headers: { 'Content-Type': 'application/json' } }
        )
        
        dispatch({
            type: 'SUCCESS_SIGN_IN',
            payload: {
                jwt: response.data.token
            }
        });
        return response.data;
    } catch (e) {
        
    }   
}