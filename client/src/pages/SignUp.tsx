import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import {Link, useHistory, useLocation} from 'react-router-dom';
import MaxWidthWrapper from '../components/Shared/MaxWidthWrapper';
import TextField from '../components/Shared/TextField';
import Button from '../components/Shared/Button';
import { Card } from '@material-ui/core';
import { useMutation } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { SignUpMutation } from './__generated__/SignUpMutation.graphql';
import OAuthSignIn from '../components/Authentication/OAuthSignIn';
import ReCAPTCHA from "react-google-recaptcha";
import ShowPassword from '../components/Authentication/ShowPassword';
import { validateEmail } from '../utils/textprocessing'
import { queryString } from '../utils/urlutils';

export default function SignUp() {
  const [state, setState] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    error: '',
    captcha: false,
    showConfirmPassword: false,
    showPassword: false,
  })
  const history = useHistory();

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [commitSignUp] = useMutation<SignUpMutation>(
    graphql`
      mutation SignUpMutation($input: SignUpInput) {
        signUp(input: $input) {
          id
          userId
          darkMode
        }
      }
    `
  )  
  const location = useLocation()

  const onComplete = () => {
    history.push('/get-started' + location.search)
  }
  const setError = (error: string) => setState({...state, error})

  const signUp = () => {
    const { email, password, name, captcha } = state

    if (email.length === 0 || !validateEmail(email)) {
      setError('Email must be valid')
      return
    }
    if (password.length < 12) {
      setError('Password must be at least 12 characters.')
      return
    }
    if (password.length >= 72) {
      setError('Password must be less than 72 characters.')
      return
    }
    /* 
    if (!captcha) {
      setError('Please complete the Captcha.')
      return
    }
    */
    commitSignUp({
      variables: {
        input: {
          email,
          password,
          name
        }
      },
      onError: (error) => {
        setError("Something went wrong. Please try again.")
      },
      onCompleted: ( val, errors ) => {
        if (errors && errors.length > 0) {
          setError(errors[0].message)
        } else {
          onComplete()
        }
      }
    })
  }

  function onCaptcha(value: string | null) {
    setState({
      ...state,
      captcha: !!value
    })
  }

  return (
    <MaxWidthWrapper width={450}>
      <Card 
        style={{marginTop: '1vw', padding: 30}} 
        variant="outlined"
        onKeyDown={e => {
          e.key === 'Enter' && signUp()
        }}
      >
        <div style={{textAlign: 'center', display: 'flex', justifyContent: 'center', justifyItems: 'center', width: '100%'}}>
            <div style={{textAlign: 'center', width: '100%'}}>
              <div style={{display: 'flex', justifyContent: 'center'}}>
                <Avatar>
                  <LockOutlinedIcon color="secondary"/>
                </Avatar>
              </div>
              <Typography component="h1" variant="h5" style={{marginTop: 10}}>
                Sign Up
              </Typography>
            </div>
        </div>
        <div style={{marginTop: 15}}>
            <Typography color='error'>
              {state.error}
            </Typography>
        </div>
        <div>
        <TextField
            label={'Name'}
            onChange={e => setState({...state, name: e.target.value})}
            style={{marginTop: 15}}
            fullWidth
            placeholder='First Last'
          />
          <TextField
            label={'Email'}
            onChange={e => setState({...state, email: e.target.value})}
            style={{marginTop: 15}}
            fullWidth
          />
          <TextField
            onChange={e => setState({...state, password: e.target.value})}
            label={'Password'}
            type={state.showPassword ? '' : 'password'}
            fullWidth
            style={{marginTop: 15}}
            InputProps={{
              endAdornment: (
                <ShowPassword
                  showPassword={state.showPassword}
                  onChange={(showPassword) => setState({...state, showPassword})}
                />
              )
            }}
          />
          <TextField
            onChange={e => setState({...state, confirmPassword: e.target.value})}
            label={'Confirm Password'}
            type={state.showConfirmPassword ? '' : 'password'}
            fullWidth
            style={{marginTop: 15}}
            InputProps={{
              endAdornment: (
                <ShowPassword
                  showPassword={state.showConfirmPassword}
                  onChange={(showConfirmPassword) => setState({...state, showConfirmPassword})}
                />
              )
            }}
          />
        </div>
        {
          process.env.NODE_ENV === 'production' &&
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <ReCAPTCHA
              sitekey={process.env.REACT_APP_GOOGLE_RECAPTCHA_KEY_ID as string}
              onChange={onCaptcha}
              style={{marginTop: 15}}
            />
          </div>
        }
        <div style={{marginTop: 15}}>
          <Button
            fullWidth
            variant='contained'
            color='primary'
            onClick={signUp}
          >
            Sign Up
          </Button>
          <OAuthSignIn
            onComplete={onComplete}
            buttonText={'Sign Up'}
            onError={(error) => setState({...state, error})}
            style={{marginTop: 10, marginBottom: 10}}
          />
          <Link to={'/signin' + location.search}>
            Already have an account? Sign In.
          </Link>
        </div>
      </Card>
      
    </MaxWidthWrapper>
  );
}
