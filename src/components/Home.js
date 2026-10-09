import React from "react";
import Hero from "./Hero";
import { About } from "./About";
import Footer from './Footer/footer';

const Home = (props) => {
    return (
        <>
            <Hero />
            <About />
            <Footer />
        </>
    )
}

export default Home;