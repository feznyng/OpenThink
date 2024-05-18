import React from 'react'
import { useSelector } from 'react-redux'
import Header from '../components/LandingPage/Header'
import SecondHeader from '../components/LandingPage/SecondHeader'
import FeaturedOrganizations from '../components/LandingPage/FeaturedOrganizations'
import Features from '../components/LandingPage/Features'
import HowItWorks from '../components/LandingPage/HowItWorks'
import Footer from '../components/LandingPage/Footer'

export default function LandingPage() {
    const {
        mobile,
        menuHeight
    } = useSelector(state => state.uiActions)
    return (
        <div>
            <div>
                <div>
                    <Header/>
                </div>
            
                <img
                    alt=""
                    src="/assets/main/top_left_rectangle.svg"
                    style={{width: '100vw', }}
                />

                <div>
                    <SecondHeader/>
                </div>

                
                <div>
                    <img
                        alt=""
                        src="/assets/main/bottom_right_rectangle.svg"
                        style={{width: '100vw',}}
                    />
                </div>
                <div style={{marginTop: -20, paddingLeft: 50, paddingRight: 50}}>
                    <HowItWorks/>
                </div>
                <img
                    alt=""
                    src="/assets/main/rectangle.png"
                    style={{width: '100vw', maxHeight: 40}}
                />
                <div style={{marginTop: '10vh', paddingLeft: 50, paddingRight: 50}}>
                    <Features/>
                </div>
                <img
                    alt=""
                    src="/assets/main/rectangle.png"
                    style={{width: '100%', maxHeight: 40}}
                />
                <div style={{marginTop: '10vh'}}>
                    <FeaturedOrganizations/>
                </div>
                <div style={{height: '5vw'}}/>
            </div>
        </div>
    )
}
