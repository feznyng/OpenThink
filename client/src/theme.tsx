import './App.css';
import {createTheme } from '@material-ui/core';
import 'bootstrap/dist/css/bootstrap.min.css';

export const primaryColor = '#2196f3';
export const secondaryColor = '#FA369B';
export const textSecondary = '#9B9B9B';

const theme = createTheme();

const rootStyle = {
    borderRadius: 15
}

const cardStyle = {
    root: {
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1);',
        ...rootStyle
    }
}

const common = {    
    typography: {
        h3: {
            fontSize: '2.2rem',
            '@media (min-width:600px)': {
                fontSize: '2.4rem',
            },
            [theme.breakpoints.up('md')]: {
                fontSize: '2.6rem',
            },
        },
    },
    overrides: {
        MuiCard: cardStyle,
        MuiAccordion: cardStyle,
        MuiCardHeader: {
            title: {
                fontWeight: 500
            }
        },
        MuiPaper: {
            root: {
                borderRadius: 15
            }
        },
        MuiCardContent: {
            root: {
                marginTop: -20
            }
        },
        MuiDialogTitle: {
            root: {
                marginBottom: -10,
                paddingLeft: 15,
                paddingRight: 15
            }
        },
        MuiDialog: {
            paper: {...rootStyle, minWidth: 300}
        },
        MuiDialogContent: {
            root: {
                paddingLeft: 15,
                paddingRight: 15
            }
        },
        MuiPopover: {
            paper: rootStyle
        },
        MuiListItem: {
            container: {
                paddingLeft: 0,
                paddingRight: 0,
            },
            root: {
                borderRadius: 10

            }
        },
        MuiOutlinedInput: {
            root: {
                borderRadius: 8
            }
        }
    }
}


export const backgroundColor = '#191919'
export const paperColor = '#202020'

export const darkTheme = createTheme({
    palette: {
        type: 'dark',
        background: {
            default: backgroundColor,
            
            paper: paperColor
        },
        primary: {
            main: primaryColor,
        },
        secondary: {
            main: secondaryColor,
        },
        error: {
            main: '#f44336',
        },
    },
    ...common
});
  
export const lightTheme = createTheme({
    palette: {
        type: 'light',
        primary: {
            main: primaryColor
        },
        secondary: {
            main: secondaryColor,
        },
        error: {
            main: '#f44336',
        },
    },
    ...common
});