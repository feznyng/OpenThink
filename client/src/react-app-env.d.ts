/// <reference types="react-scripts" />
declare module '@absinthe/socket';
declare module '@absinthe/socket-relay';
declare module 'babel-plugin-relay/macro' {
	export { graphql as default } from 'react-relay'
}
declare module 'react-color'
