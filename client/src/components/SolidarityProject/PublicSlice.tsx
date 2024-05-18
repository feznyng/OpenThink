import { createSlice } from '@reduxjs/toolkit'
import store from '../../Store'

interface PublicState {
    userId: number | null,
    firstname: string,
    lastname: string,
    name: string
}
  
const initialState: PublicState = {
    userId: null,
    firstname: '',
    lastname: '',
    name: ''
}

export const publicSlice = createSlice({
  name: 'public',
  initialState,
  reducers: {
    createAccount: (state, {payload}: {payload: PublicState}) => {
        state.firstname = payload.firstname
        state.lastname = payload.lastname
        state.userId = payload.userId
        state.name = payload.name

        console.log(state)
    },
  },
})

export const { createAccount } = publicSlice.actions

export default publicSlice.reducer