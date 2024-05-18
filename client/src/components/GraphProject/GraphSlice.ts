import { createSlice } from '@reduxjs/toolkit'

interface GraphState {
  sidebarOpen: boolean,
  viewTable: boolean
}
  
const initialState: GraphState = {
  sidebarOpen: false,
  viewTable: false
}

export const graphSlice = createSlice({
  name: 'graph',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
        state.sidebarOpen = !state.sidebarOpen
    },
  },
})

export const { toggleSidebar } = graphSlice.actions

export default graphSlice.reducer
