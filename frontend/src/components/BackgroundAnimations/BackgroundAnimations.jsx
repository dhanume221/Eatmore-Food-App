import React from 'react';
import './BackgroundAnimations.css';
import chilli from '../../assets/chilli.png';
import tomato from '../../assets/burger.png';
import onion from '../../assets/onion.png';

const BackgroundAnimations = () => {
    return (
        <div className="background-animations">
            <img src={chilli} alt="chilli" className="floating-item chilli" />
            <img src={tomato} alt="tomato" className="floating-item tomato" />
            <img src={onion} alt="onion" className="floating-item onion" />
            <img src={chilli} alt="chilli" className="floating-item chilli-2" />
            <img src={tomato} alt="tomato" className="floating-item tomato-2" />
            <img src={onion} alt="onion" className="floating-item onion-2" />
        </div>
    );
};

export default BackgroundAnimations;
