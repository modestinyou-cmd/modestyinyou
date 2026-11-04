'use client';

import {FormEvent, useState} from 'react';

export default function Contact(){
  const[submitted,setSubmitted]=useState(false);

  function submit(e:FormEvent){
    e.preventDefault();
    setSubmitted(true);
  }

  return <div className="page-shell" style={{textAlign:'center'}}>
    <p className="breadcrumbs" style={{textAlign:'left'}}>Home / Contact</p>
    <span className="eyebrow">We&apos;re here to help</span>
    <h1 className="page-title" style={{textAlign:'center'}}>Get in touch</h1>
    <p className="page-intro" style={{margin:'10px auto 10px',textAlign:'center'}}>Questions about the store or a future order? Send us a note.</p>
    <p className="page-intro" style={{margin:'0 auto 40px',textAlign:'center'}}>Email us at <a className="text-link" href="mailto:modestinyou@gmail.com">modestinyou@gmail.com</a>.</p>
    {submitted
      ? <div className="notice" style={{maxWidth:650,margin:'0 auto',textAlign:'left'}} role="status">Thanks for reaching out. This demo form does not send messages yet; email us directly at modestinyou@gmail.com.</div>
      : <form onSubmit={submit} style={{maxWidth:650,margin:'0 auto',textAlign:'left'}}>
        <div className="form-grid">
          <label className="form-field" htmlFor="name">Name<input id="name" required/></label>
          <label className="form-field" htmlFor="email">Email<input id="email" type="email" required/></label>
          <label className="form-field full-span" htmlFor="message">Message<textarea id="message" rows={6} required/></label>
        </div>
        <button className="button button-dark" style={{marginTop:20}}>Send message</button>
      </form>}
  </div>;
}
