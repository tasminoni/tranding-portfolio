import {useState} from 'react';
import {ArrowUpRight,Mail} from 'lucide-react';
import {site} from '../site';
export function ContactForm(){
 const [status,setStatus]=useState('');
 return <form className="contact-form" onSubmit={e=>{
 e.preventDefault();
 const f=new FormData(e.currentTarget);
 window.location.href='mailto:'+site.email+'?subject='+encodeURIComponent('Portfolio enquiry from '+f.get('name'))+'&body='+encodeURIComponent(f.get('message')+'\n\nFrom: '+f.get('name')+'\nEmail: '+f.get('email'));
 setStatus('Your email app will open with a draft. Send it there to deliver your message.');
 }}>
 <label>Your name<input name="name" placeholder="What should I call you?" required maxLength={100} autoComplete="name"/></label>
 <label>Email address<input name="email" placeholder="you@example.com" type="email" required autoComplete="email"/></label>
 <label className="message">What are you working on?<textarea name="message" placeholder="Tell me a little about your idea…" required rows={3} maxLength={3000}/></label>
 <button className="button primary" type="submit"><Mail size={16}/> Create email draft <ArrowUpRight size={16}/></button><p role="status">{status||'Opens your email app. Nothing is sent automatically.'}</p>
 </form>;
}
