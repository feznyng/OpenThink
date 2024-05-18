import { Store as ReduxStore } from "redux";
import { configureStore, ThunkDispatch, Action } from "@reduxjs/toolkit";
import rootReducer from "./reducers/rootReducer";
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import * as withAbsintheSocket from "@absinthe/socket";
import { createSubscriber } from "@absinthe/socket-relay";
import { Socket as PhoenixSocket } from "phoenix";
import { commitMutation, Environment, fetchQuery, Network, Observable, RecordSource, Store as RelayStore } from 'relay-runtime';
import { v4 as uuidv4 } from 'uuid';
import fetchGraphQL from './utils/graphqlutils';
import graphql from 'babel-plugin-relay/macro';
import { StoreSocketAuthQuery } from "./__generated__/StoreSocketAuthQuery.graphql";


export const baseURL = process.env.REACT_APP_REALTIME_GRAPHQL_URL as string

const persistConfig = {
    key: 'root',
    storage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store: ReduxStore<any, any> = configureStore({
    reducer: persistedReducer, 
    devTools: process.env.NODE_ENV === 'development'
});
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type ThunkAppDispatch = ThunkDispatch<RootState, void, Action>;

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export default store;
export const clientId = uuidv4();

let token = ''

export const socket = new PhoenixSocket(baseURL, {
  params: () => ({token})
})

const absintheSocket = withAbsintheSocket.create(
  socket
);

const legacySubscribe = createSubscriber(absintheSocket);

const subscribe = (request: any, variables: any, cacheConfig: any) => { // legacy fix for absinthe relay's socket library - need custom code later
  return Observable.create(sink => {
    legacySubscribe(request, variables, cacheConfig, {
      onNext: sink.next,
      onError: sink.error,
      onCompleted: sink.complete
    });
  });
};

// Relay passes a "params" object with the query name and text. So we define a helper function
// to call our fetchGraphQL utility with params.text.
async function fetchRelay(params: any, variables: any, _cacheConfig: any, uploadables: any) {
  return fetchGraphQL(params.text, variables, uploadables);
}

export const environment = new Environment({
  network: Network.create(fetchRelay, subscribe as any),
  store: new RelayStore(new RecordSource()),
});

export const getToken = () => fetchQuery<StoreSocketAuthQuery>(
  environment,
  graphql`
    query StoreSocketAuthQuery {
      socketAuth {
        token
      }
    }
  `,
  {},
)

export const connectSocket = () => {
  getToken().subscribe({
    next: (data) => {
      const newToken = data.socketAuth?.token
      if (newToken) {
        token = newToken
        socket.connect()
      }
    }
  });
}

export const disconnectSocket = () => {
  socket.disconnect(() => console.log('disconnected'))
}