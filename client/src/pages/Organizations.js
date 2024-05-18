import React from 'react'
import { useSelector } from 'react-redux'
import Header from '../components/LandingPage/Organizations/Header'
import SecondHeader from '../components/LandingPage/Organizations/SecondHeader'
import Features from '../components/LandingPage/Organizations/Features';
export default function LandingPage() {
    const {
        mobile,
        menuHeight
    } = useSelector(state => state.uiActions)
    return (
        <div style={{paddingTop: '2vh'}}>
            <div>
                <div>
                    <Header/>
                </div>
            
                <img
                    alt=""
                    src="/assets/main/bottom_right_rectangle.svg"
                    style={{maxWidth: '100%'}}
                />

                <div style={{maxHeight: 500}}>
                    <SecondHeader/>
                </div>

                
                <div>
                    <img
                        alt=""
                        src="/assets/main/top_left_rectangle.svg"
                        style={{maxWidth: '100%'}}
                    />
                </div>
                <div style={{marginTop: -20, paddingLeft: 50, paddingRight: 50}}>
                    <Features/>
                </div>
                <img
                    alt=""
                    src="/assets/main/rectangle.png"
                    style={{width: '100%', maxHeight: 40}}
                />
            </div>
        </div>
    )
}
