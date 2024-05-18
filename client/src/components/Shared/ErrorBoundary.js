import React from 'react';
import { withRouter } from 'react-router';
import ErrorPage from '../../pages/ErrorPage';

class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
      
    }
  

    static getDerivedStateFromError(error) {    
      // Update state so the next render will show the fallback UI.  
      window.scrollTo(0, 0) 
      return { hasError: true }; 
    }

    componentDidCatch(error, info) {}

    componentDidUpdate(prevProps) {
      if (this.state.error && (prevProps.history.location.pathname !== this.props.history.location.pathname)) {
        this.setState({
          ...this.state,
          hasError: false,
        })
      }
    }

    render() {
        if (this.state.hasError) {      
          return (
            <ErrorPage/>
          )
        }    
        return this.props.children;
    }
  }

  export default withRouter(ErrorBoundary)