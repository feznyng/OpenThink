import { createSlice } from '@reduxjs/toolkit'

interface PostState {
    signedIn: boolean,
    darkMode: boolean
}
  
const initialState: PostState = {
    signedIn: false,
    darkMode: false
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
      setSignedIn: (state, {payload}: {payload: boolean}) => {
          state.signedIn = payload
      },
      setDarkMode: (state, {payload}: {payload: boolean}) => {
          state.darkMode = payload
      }
    }
})

export const { setSignedIn, setDarkMode } = userSlice.actions

export default userSlice.reducer