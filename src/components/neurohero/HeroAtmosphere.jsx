import React,{useEffect,useState} from 'react';
import {getDevicePortrait} from '../../utils/neurohero/portraitDevice.mjs';
// Reuse accepted local artwork; expose readiness so printing never races image storage.
export default function HeroAtmosphere({asset}){
 const [image,setImage]=useState({url:null,status:asset?'loading':'none'});
 useEffect(()=>{let disposed=false,objectURL=null;setImage({url:null,status:asset?'loading':'none'});if(asset)getDevicePortrait(asset).then(async blob=>{if(!blob){if(!disposed)setImage({url:null,status:'missing'});return;}objectURL=URL.createObjectURL(blob);const decoded=new Image();decoded.src=objectURL;await decoded.decode();if(!disposed)setImage({url:objectURL,status:'ready'});else URL.revokeObjectURL(objectURL);}).catch(()=>{if(!disposed)setImage({url:null,status:'missing'});});return()=>{disposed=true;if(objectURL)URL.revokeObjectURL(objectURL);};},[asset?.id,asset?.sha256]);
 return <div className="nh-hero-atmosphere" data-artwork-state={image.status} aria-hidden="true">{image.url&&<><img src={image.url} alt=""/><span/></>}</div>;
}
