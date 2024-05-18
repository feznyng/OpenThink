import { createSlice } from '@reduxjs/toolkit'

interface OnboardingState {
    skills: string[],
    topics: string[]
}
  
const initialState: OnboardingState = {
    skills: [],
    topics: []
}

export const onboardingSlice = createSlice({
    name: 'onboarding',
    initialState,
    reducers: {
        setSkills: (state, {payload}: {payload: string[]}) => {
            state.skills = payload
        },
        setTopics: (state, {payload}: {payload: string[]}) => {
            state.topics = payload
        },
    }
})

export const { setSkills, setTopics } = onboardingSlice.actions

export default onboardingSlice.reducer