import React,{useRef} from 'react';
import './SupportNow.css';

// Official resource information checked 2026-10-06:
// https://988lifeline.org/ · https://www.crisistextline.org/
// https://www.911.gov/calling-911/ · https://findahelpline.com/
function SupportLink({href,children}){
 const external=href.startsWith('https:');
 return <a href={href} {...(external?{target:'_blank',rel:'noopener noreferrer',referrerPolicy:'no-referrer'}:{})}>{children}{external&&<span className="cc-support-sr"> (opens in a new tab)</span>}</a>;
}

export default function SupportNow(){
 const disclosure=useRef(null);
 const close=()=>{disclosure.current.open=false;disclosure.current.querySelector('summary').focus({preventScroll:true});};
 return <aside className="cc-support-now" aria-label="Immediate support">
  <details ref={disclosure} onKeyDown={event=>{if(event.key==='Escape'&&disclosure.current.open){event.preventDefault();close();}}}>
   <summary><strong>Need support now?</strong><span>Call or text 988 in the US · More options</span></summary>
   <div className="cc-support-options">
    <p>You can pause here and reach out.</p>
    <ul>
     <li><strong>988 Suicide &amp; Crisis Lifeline <small>US</small></strong><div className="cc-support-links"><SupportLink href="tel:988">Call 988</SupportLink><SupportLink href="sms:988">Text 988</SupportLink><SupportLink href="https://chat.988lifeline.org/">Chat with 988</SupportLink></div></li>
     <li><strong>Crisis Text Line <small>US</small></strong><div className="cc-support-links"><SupportLink href="sms:741741">Text HOME to 741741</SupportLink></div></li>
     <li><strong>For an emergency in the US</strong><div className="cc-support-links"><SupportLink href="tel:911">Call 911</SupportLink></div></li>
     <li><strong>Outside the US</strong><div className="cc-support-links"><SupportLink href="https://findahelpline.com/">Find a helpline in your country</SupportLink></div></li>
    </ul>
    <button type="button" onClick={close}>Close support options</button>
   </div>
  </details>
 </aside>;
}
