import {useCallback,useEffect,useRef,useState} from 'react';
import {createReflectionNavigation,WELCOME_ROUTE} from '../utils/reflectionNavigation.mjs';

export function useReflectionNavigation(sectionCount){
 const [route,setRoute]=useState({...WELCOME_ROUTE}),controller=useRef(null);
 useEffect(()=>{
  const navigation=createReflectionNavigation(window,next=>{
   setRoute(next);window.scrollTo({top:0,behavior:'auto'});
   requestAnimationFrame(()=>{
    if(document.activeElement?.closest('.cc-support-now'))return;
    const heading=document.querySelector('main h1, main .cc-assessment-wrap h2');
    if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
   });
  },sectionCount);
  controller.current=navigation;
  return()=>{navigation.dispose();controller.current=null;};
 },[sectionCount]);
 const navigate=useCallback((screen,patch={})=>controller.current?.navigate({...patch,screen}),[]);
 return {route,navigate};
}

export function useLeaveWarning(unsaved){
 useEffect(()=>{
  if(!unsaved)return;
  const warn=event=>{event.preventDefault();event.returnValue='';};
  window.addEventListener('beforeunload',warn);
  return()=>window.removeEventListener('beforeunload',warn);
 },[unsaved]);
}
