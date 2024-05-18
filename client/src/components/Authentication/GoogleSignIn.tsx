import React, { CSSProperties, useState } from 'react'
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import { useMutation } from 'react-relay';
import Button from '../Shared/Button';
import graphql from 'babel-plugin-relay/macro';
import { ExternalSignInProps } from './OAuthSignIn'
import { GoogleSignInMutation } from './__generated__/GoogleSignInMutation.graphql';
import { access } from 'fs';

export default function GoogleSignIn({style, buttonText, onError, onComplete}: ExternalSignInProps) {
    const [state, setState] = useState({
        hideGoogle: false
    })

    const [commitGoogleSignIn] = useMutation<GoogleSignInMutation>(
        graphql`
            mutation GoogleSignInMutation($input: GoogleSignInInput) {
                googleSignIn(input: $input) {
                    userId
                    darkMode
                }
            }
        `
    )

    const onSignIn = (result: GoogleLoginResponse | GoogleLoginResponseOffline) => {
        const accessToken = (result as GoogleLoginResponse)?.accessToken
        console.log(accessToken)
        if (accessToken) {
            commitGoogleSignIn({
                variables: {
                    input: {
                        accessToken
                    }
                },
                onCompleted: (response, errors) => {
                    if (errors && errors.length > 0) {
                        onError('Something went wrong. Please try again.')
                    } else {
                        onComplete()
                    }
                },
                onError: () => {
                    onError('Something went wrong. Please try again.')
                }
            })
        }
        
    }

    const onGoogleFailure = () => {
        setState({
            ...state,
            hideGoogle: true
        })
    }

    return (
        <div style={style}>
            {
                !state.hideGoogle &&
                <GoogleLogin
                    clientId={process.env.REACT_APP_GOOGLE_OAUTH_ID as string}
                    onSuccess={onSignIn}
                    onFailure={onGoogleFailure}
                    cookiePolicy={'single_host_origin'}
                    style={{width: 500}}
                    render={renderProps => (
                        <Button
                            onClick={renderProps.onClick} 
                            disabled={renderProps.disabled}
                            variant="contained"
                            fullWidth
                            startIcon={
                                <img 
                                    src="/assets/Google.png" 
                                    alt="" 
                                    style={{height: 23, width: 23}}
                                />
                            }
                        >
                            {buttonText}
                        </Button>
                    )}
                />
            }
        </div>
  )
}
