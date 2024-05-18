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
import { SignInMutation } from './__generated__/SignInMutation.graphql';
import OAuthSignIn from '../components/Authentication/OAuthSignIn';
import ShowPassword from '../components/Authentication/ShowPassword';
import { queryString } from '../utils/urlutils';

export default function SignIn() {
  const [state, setState] = useState({
    email: '',
    password: '',
    showPassword: false,
    error: ''
  })
  const history = useHistory();

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [commitSignIn, inProgress] = useMutation<SignInMutation>(
    graphql`
      mutation SignInMutation($input: SignInInput) {
        signIn(input: $input) {
          id
          userId
          darkMode
        }
      }
    `
  )
  const location = useLocation()
  const { key } = queryString.parse(location.search)

  const setError = (error: string) => setState({...state, error})
  const onComplete = () => {
    key ? setTimeout(() => history.replace(`/invite/${key}`), 200) : history.replace('/')
  }

  const signIn = () => {
    const { email, password } = state
    if (email.length === 0) {
      setError('Please enter a valid email.')
      return
    }
    if (password.length === 0) {
      setError('Please enter a password.')
      return
    }
    commitSignIn({
      variables: {
        input: {
          email,
          password
        }
      },
      onError: (error) => {
        setState({
          ...state,
          error: "Something went wrong. Please try again."
        })
      },
      onCompleted: ( val, errors ) => {
        if (errors && errors.length > 0) {  
          setState({
            ...state,
            error: "Email or password didn't match. Please try again."
          })
        } else {
          onComplete()
        }
      }
    })
  }

  return (
    <MaxWidthWrapper width={450}>
      <Card 
        style={{marginTop: '5vw', padding: 30}} 
        variant="outlined"
        onKeyDown={e => {
          e.key === 'Enter' && signIn()
        }}
      >
        <div style={{textAlign: 'center', display: 'flex', justifyContent: 'center', justifyItems: 'center', width: '100%'}}>
            <div style={{textAlign: 'center', width: '100%'}}>
              <div style={{display: 'flex', justifyContent: 'center'}}>
                <Avatar>
                  <LockOutlinedIcon color="primary"/>
                </Avatar>
              </div>
              <Typography component="h1" variant="h5" style={{marginTop: 10}}>
                Sign In
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
        </div>
        <div style={{marginTop: 15}}>
          <Button
            fullWidth
            variant='contained'
            color='primary'
            loading={inProgress}
            onClick={signIn}
          >
            Sign In
          </Button>
          <OAuthSignIn
            onComplete={onComplete}
            onError={(error) => setError(error)}
            buttonText={'Sign In'}
            style={{marginTop: 10, marginBottom: 10}}
          />
          <Link 
            to={'/signup' + location.search}
          >
            Don't have an account yet? Sign Up.
          </Link>
        </div>
      </Card>
      
    </MaxWidthWrapper>
  );
}
