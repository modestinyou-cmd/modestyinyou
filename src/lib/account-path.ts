export function safeInternalPath(value:string|null|undefined,fallback='/account'){
  if(!value||!value.startsWith('/')||value.startsWith('//')||value.includes('\\')) return fallback;
  return value;
}
