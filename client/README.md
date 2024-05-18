# OpenThink Frontend

React frontend for OpenThink. Uses Relay Modern for a GraphQL client and Redux for state management.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

### `yarn relay`
Starts up the relay compiler with watch turned off. Will automatically regenerate static queries in file changes. During development you can run yarn relay in one shell and yarn start in another. 

