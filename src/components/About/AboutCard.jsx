import React from "react";
import './about.css';
import youtubeLogo from './youtube-logo.png';


function AboutCard({ content, image, imgToRight, title }) {
  return (
    <div className="about-container lg:mt-32 mt-24">
      <div className={`flex flex-col mx-4 md:mx-10 mt-10 flex-wrap justify-center items-center`}>
        {/* <h1 className="main-container flex-[100%] text-center text-4xl font-bold uppercase bg-gradient-to-r from-[#020928] to-[#F7CA17] inline-block text-transparent bg-clip-text">
          {title}
        </h1> */}

        {/* about_us div - it will appear above the card div */}
        <div className="about_us w-full text-center">
        </div>

        {/* card div - it will appear below the about_us div */}
        <div className="about-card text-black p-10 rounded-md w-full">
          <div className=" z-5 flex justify-center items-center duration-700 flex-col sm:flex-row">
            {/* Uncomment this if you need to display an image */}
            {/* <div className="sm:w-[100%] md:w-[45%] flex justify-center items-center">
              <img className="sm:w-[330px] md:w-[590px] max-w-full rounded-md" src={image} alt="themelogo" />
            </div> */}
            <div className="theme-content sm:w-[100%] md:w-[45%] text-md space-x-9">
              {content}
            </div>
          </div>
        </div>
        <br />
      </div>
        <div className="youtube-links">
          <a href="https://www.youtube.com/watch?v=LJLtHr0kcrA&t=1s" target="_blank" rel="noopener noreferrer" className="youtube-link">
            <img src={youtubeLogo} alt="YouTube" className="youtube-icon" /> &nbsp;What is Technozion ?
          </a>
          <a href="https://www.youtube.com/watch?v=1T_d1YoCWuA" target="_blank" rel="noopener noreferrer" className="youtube-link">
            <img src={youtubeLogo} alt="YouTube" className="youtube-icon" /> &nbsp;Technozion Highlights
          </a>
        </div>
        <section className="w-full z-10 h-full">
          <h1 className="text-center">Technozion Brochure</h1>
          

<div style={{ height: '800px', width: '100%' }}>
  <iframe
    src="/pdf/tz.pdf#toolbar=0&zoom=60&"
    title="Embedded PDF Document"
   
    style={{ border: 'none', width: '80%', margin: 'auto', height: '100%' }}
  >
    {/* This content inside the <iframe> tag acts as the fallback 
      for browsers (especially on mobile) that cannot render 
      the PDF inline.
    */}
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <p>
        **Sorry, your browser doesn't support embedded PDFs on this device.**
      </p>
      <a
        href="/pdf/tz.pdf"
        target="_blank"
        rel="noopener noreferrer"
        download // Optional: suggests a download instead of just viewing
        style={{
          display: 'inline-block',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px',
          marginTop: '10px',
        }}
      >
        📥 Download PDF
      </a>
    </div>
  </iframe>
</div>
          {/* <object data="/pdf/tz.pdf#toolbar=0&zoom=100&" type="application/pdf" width="100%" height="700px" className="mx-auto lg:mb-32 mb-10">
          <p>Technozion 25 brochure</p>
          </object> */}
        </section>
    </div>
  );
}

export default AboutCard;
