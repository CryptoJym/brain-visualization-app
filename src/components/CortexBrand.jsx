import React from 'react';
export const BRAND_VERSION='cc-brand-20260912';
/** Approved logo in context-appropriate contrast; the artwork owns its wordmark. */
export default function CortexBrand({variant='nav',className=''}) {
  const light=variant==='paper';
  return <span className={`cc-identity cc-identity-${variant} ${className}`} data-brand-version={BRAND_VERSION}>
    <picture>
      <source media="print" srcSet={`/brand/logo-lockup-light.svg?v=${BRAND_VERSION}`}/>
      <img src={`/brand/logo-lockup-${light?'light':'dark'}.svg?v=${BRAND_VERSION}`} width="1370" height="270" alt="Cortex Compass" decoding="async"/>
    </picture>
    <span className="cc-identity-by">by Utlyze</span>
  </span>;
}
