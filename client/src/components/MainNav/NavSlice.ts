import { createSlice } from '@reduxjs/toolkit'

interface NavState {
    sidebarOpen: boolean
}
  
const initialState: NavState = {
    sidebarOpen: false
}


export const navSlice = createSlice({
  name: 'nav',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
        state.sidebarOpen = !state.sidebarOpen
    },
    setSidebar: (state, {payload}: {payload: boolean}) => {
      state.sidebarOpen = payload
  },
  },
})

export const { toggleSidebar, setSidebar} = navSlice.actions

export default navSlice.reducer