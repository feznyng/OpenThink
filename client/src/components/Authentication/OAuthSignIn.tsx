import { CSSProperties } from 'react';
import GoogleSignIn from './GoogleSignIn';

export interface ExternalSignInProps {
  onComplete: () => void,
  onError: (message: string) => void,
  style?: CSSProperties,
  buttonText: string
}

interface OAuthSignInProps extends ExternalSignInProps{
  style?: CSSProperties
}

export default function OAuthSignIn({style, ...props}: OAuthSignInProps) {
  return (
    <div style={{width: '100%', ...style}}>
      <GoogleSignIn
        {...props}
      />
    </div>
  );
}
