import { createSlice } from '@reduxjs/toolkit'

interface RouterState {
    lastPage: string | null
}

const initialState: RouterState = {
    lastPage: null
}

export const routerSlice = createSlice({
    name: 'router',
    initialState,
    reducers: {
        setLastPage: (state, {payload}: {payload: string}) => {
            state.lastPage = payload
        },
    }
})

export const { setLastPage } = routerSlice.actions
export default routerSlice.reducer