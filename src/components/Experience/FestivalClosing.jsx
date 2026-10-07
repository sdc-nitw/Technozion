import React from "react";
import { Link } from "react-router-dom";
import { FiArrowUpRight, FiDownload } from "react-icons/fi";
import TextReveal from "./TextReveal";
import ParallaxLayer from "./ParallaxLayer";
import { festival } from "../../data/festival";

export default function FestivalClosing() {
  return <>
    <section className="festival-about" aria-labelledby="festival-about-heading">
      <p className="scene-eyebrow">THE TECHNOZION STORY</p>
      <TextReveal id="festival-about-heading">BUILT BY CURIOSITY.</TextReveal>
      <div className="festival-about-body"><TextReveal as="p" mode="scrub">{festival.about}</TextReveal>
        <div className="festival-about-links"><Link className="scene-link" to="/about">Discover Technozion <FiArrowUpRight /></Link><Link className="scene-link" to="/past-events">Explore past editions <FiArrowUpRight /></Link><Link className="scene-link" to="/team">Meet the minds <FiArrowUpRight /></Link></div>
      </div>
    </section>
    <section className="festival-invitation">
      <ParallaxLayer className="invitation-outline" distance={65} aria-hidden="true">TECHNOZION</ParallaxLayer>
      <p className="scene-eyebrow">OCTOBER 30–31 / 2026</p><TextReveal>MAKE YOUR MOVE.</TextReveal>
      <Link to="/register" className="invitation-register">REGISTER FOR 2026 <FiArrowUpRight /></Link>
      <Link to="/events" className="scene-link">Find your event <FiArrowUpRight /></Link>
    </section>
    <section className="festival-resources" id="brochure" aria-labelledby="resources-heading">
      <div className="resources-heading"><p className="scene-eyebrow">EVERYTHING YOU NEED</p><h2 id="resources-heading">THE FESTIVAL GUIDE.</h2></div>
      <div className="resources-grid">
        <div className="brochure-resource">
          <a href={festival.brochure} target="_blank" rel="noopener noreferrer" aria-label="Open the Technozion 2026 brochure"><img src="/pdf/brochure-cover.png" alt="Technozion 2026 brochure: Innovation Beyond Boundaries, October 30–31" loading="lazy" width="1400" height="788" /></a>
          <h3>Official brochure &amp; event guide</h3><p>Explore the events, rules, points of contact and festival details in one place.</p>
          <div className="resource-actions"><a className="scene-link" href={festival.brochure} target="_blank" rel="noopener noreferrer">Read the brochure <FiArrowUpRight /></a><a className="scene-link" href={festival.brochure} download="Technozion-2026-Brochure.pdf">Download PDF <FiDownload /></a></div>
        </div>
        <div className="festival-contact"><h3>STAY IN THE LOOP.</h3>
          <a className="contact-email" href={"mailto:" + festival.email}>{festival.email}</a>
          <div className="festival-socials"><a className="scene-link" href={festival.instagram} target="_blank" rel="noopener noreferrer">Instagram <FiArrowUpRight /></a><a className="scene-link" href={festival.facebook} target="_blank" rel="noopener noreferrer">Facebook <FiArrowUpRight /></a><a className="scene-link" href={festival.institute} target="_blank" rel="noopener noreferrer">NIT Warangal <FiArrowUpRight /></a></div>
          <h4>STUDENT COORDINATORS</h4><ul className="coordinator-list">{festival.coordinators.map(person => <li key={person.name}><span>{person.name}</span><a href={"tel:+91" + person.phone}>{person.phone}</a></li>)}</ul>
        </div>
      </div>
    </section>
  </>;
}
