import { Fade, Typography, Card, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core'
import { ChevronLeft, ChevronRight, Close, ExitToApp } from '@material-ui/icons'
import React from 'react'
import { useHistory, useLocation, useParams } from 'react-router'
import { setNav } from '../actions/uiActions';
import AboutUser, { AboutUserData } from '../components/Onboarding/AboutUser'
import GroupSelector from '../components/Onboarding/GroupSelector';
import { usePreloadedQuery, useMutation } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { OnboardingMenuQuery } from './__generated__/OnboardingMenuQuery.graphql'
import { useAppDispatch, useAppSelector } from '../Store'
import BaseButton from '../components/Shared/Button'
import { OnboardingMenuSaveSkillsMutation } from './__generated__/OnboardingMenuSaveSkillsMutation.graphql';
import MaxWidthWrapper from '../components/Shared/MaxWidthWrapper';
import { setSkills, setTopics } from '../components/Onboarding/OnboardingSlice';
import { queryString } from '../utils/urlutils';

const LAST_PAGE = 'spaces';

const Button = (props: any) => {
    return <BaseButton {...props} style={{textTransform: 'none', ...props.style}}>{props.children}</BaseButton>
}

const navButtonProps = {size: 'large', variant: 'contained'}

interface OnboardingMenuProps {
    queryRef: any
}

interface OnboardingMenuState {
    page: number,
    confirmLeaving: boolean
}


export default function OnboardingMenu({queryRef}: OnboardingMenuProps) {
    const {me, ...data} = usePreloadedQuery<OnboardingMenuQuery>(
        graphql`
            query OnboardingMenuQuery($spaceCount: Int!, $spaceCursor: String, $query: String) {
                me {
                    firstname
                }
                ...GroupSelectorResults
            }
        `,
        queryRef
    )

    React.useEffect(() => {
        console.log('reinitializing parent')
        dispatch(setNav(false))
    }, []);


    const [state, setState] = React.useState<OnboardingMenuState>({
        page: 0,
        confirmLeaving: false,
    })

    const selectedSkills = useAppSelector(state => state.onboarding.skills)
    const selectedInterests = useAppSelector(state => state.onboarding.topics)

    const history = useHistory()
    const location = useLocation()
    const { page } = useParams<any>()
    const { key } = queryString.parse(history.location.search)

    const exitOnboarding = () => key ? history.push(`/invite/${key}`) : history.push('/')
    const goTo = (link: string) => history.push(link + location.search)
    const moveNext = () => {
        switch(page) {
            case 'skills-and-interests':
                saveSkillsAndInterests()
                goTo('/get-started/spaces')
                break
            case 'spaces':
                dispatch(setSkills([]))
                dispatch(setTopics([]))
                exitOnboarding()
                break
            default:
                goTo('/get-started/skills-and-interests')
                break
        }
    }
    const moveBack = () => {
        switch(page) {
            case 'skills-and-interests':
                saveSkillsAndInterests()
                goTo('/get-started')
                break
            case 'spaces':
                goTo('/get-started/skills-and-interests')
                break
        }
    }

    const [commitSaveSkills] = useMutation<OnboardingMenuSaveSkillsMutation>(
        graphql`
            mutation OnboardingMenuSaveSkillsMutation($skillsInput: ChangeSkillsInput!, $topicsInput: ChangeSkillsInput!) {
                saveSkills(input: $skillsInput)
                saveTopics(input: $topicsInput)
            }
        `
    )

    const saveSkillsAndInterests = () => {
        commitSaveSkills({
            variables: {
                skillsInput: {
                    items: selectedSkills
                },
                topicsInput: {
                    items: selectedInterests
                },
            }
        })
    }

    const dispatch = useAppDispatch()
    const isFirst = (page === '' || !page)

    return (
        <div style={{position: 'relative', padding: 10, paddingTop: 20}}>
            <div style={{width: '100%', paddingTop: 50}}>
                {
                    isFirst && 
                    <div style={{display: 'flex', justifyContent: 'center', maxWidth: 1000, width: '100%', paddingTop: '15vw'}}>
                        <div>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <Typography variant="h3" style={{fontWeight: 'bold'}}>
                                    Hi {me?.firstname}, welcome to 
                                </Typography>
                                <img
                                    alt=""
                                    style={{height: 75, marginLeft: -18}}
                                    src="/assets/main/main_title.svg"
                                />
                            </div>

                            <Typography variant="body1" style={{fontSize: 20}}>
                                Let's get your account set up.
                            </Typography>
                            <Button 
                                {...navButtonProps} 
                                color="primary" 
                                onClick={moveNext} 
                                style={{marginTop: 20,}}
                                endIcon={<ChevronRight/>}
                            >  
                                Begin
                            </Button>
                        </div>
                    </div>
                }
                {
                    page === 'skills-and-interests' &&
                    <MaxWidthWrapper width={700}>
                        <AboutUser
                            data={{selectedInterests, selectedSkills}}
                            onChange={aboutUser => {
                                dispatch(setSkills(aboutUser.selectedSkills))
                                dispatch(setTopics(aboutUser.selectedInterests))
                            }}
                        />
                    </MaxWidthWrapper>
                }
                {
                    page === 'spaces' &&
                    <div>
                        <GroupSelector
                            root={data}
                        />
                    </div>
                }
            </div>
            {

                !isFirst && 
                <div style={{position: 'fixed', bottom: 0, left: 0, width: '100%'}}>
                    <Card style={{width: '100%', display: 'flex', justifyContent: 'center', padding: 10, borderTopLeftRadius: 0, borderTopRightRadius: 0, position: 'relative'}}>
                        <div style={{display: 'flex', float: 'right', }}>
                            {
                               !isFirst && 
                                <div style={{display: 'flex', alignItems: 'center', marginRight: 10}} >
                                    <Button 
                                        {...navButtonProps}
                                        color="secondary"
                                        onClick={moveBack}
                                        startIcon={<ChevronLeft/>}
                                    >  
                                        Back
                                    </Button>
                                </div>
                            }
                        <Button 
                            color="primary" 
                            {...navButtonProps} 
                            onClick={moveNext}
                            endIcon={<ChevronRight/>}
                        >  
                            {page === LAST_PAGE ? 'Finish' : 'Next'}
                        </Button>
                        </div>
                        <div
                            style={{position: 'absolute', top: 0, right: 10, height: '100%', display: 'flex', alignItems: 'center'}}
                        >
                            <Button 
                                style={{textTransform: 'none'}} 
                                endIcon={<ExitToApp />}
                                onClick={() => setState({...state, confirmLeaving: true})}
                                size="large"
                            >
                                Skip
                            </Button>   
                        </div>
                    </Card>
                </div>
            }
            <Dialog open={state.confirmLeaving}>
                <DialogTitle>
                    Exit Onboarding
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to exit? Your groups have been saved but your skills and interests will be gone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setState({...state, confirmLeaving: false,})}>
                        Cancel
                    </Button>
                    <Button 
                        variant="contained" 
                        style={{color: 'white', backgroundColor: 'red'}} 
                        onClick={() => {
                            setState({...state, confirmLeaving: false,})
                            exitOnboarding()
                        }}
                        startIcon={<Close/>}
                    >
                        Exit
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
