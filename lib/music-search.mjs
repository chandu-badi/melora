const languageCodes = { All: null, Telugu: 'te', Hindi: 'hi', English: 'en' };
const response = (body, status=200) => Response.json(body, {status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
export function createMusicSearch({fetcher=fetch, now=Date.now}={}) {
  const cache = new Map(), rates = new Map();
  return async function search(request, apiKey, userId) {
    if (!userId) return response({code:'SIGN_IN_REQUIRED',message:'Sign in to search music.'},401);
    const url=new URL(request.url),query=(url.searchParams.get('q')||'').trim(),language=url.searchParams.get('language')||'All',pageToken=url.searchParams.get('pageToken')||'';
    if(query.length<2||query.length>100||/[\u0000-\u001f]/.test(query)||!Object.hasOwn(languageCodes,language)||pageToken.length>500||!/^[-_A-Za-z0-9=]*$/.test(pageToken))return response({code:'INVALID_SEARCH',message:'Enter 2–100 characters and choose a supported language.'},400);
    if(!apiKey)return response({code:'SEARCH_SETUP_REQUIRED',message:'Global search is not connected yet. The app owner needs to configure a YouTube Data API key. You can still search the saved collection.'},503);
    const timestamp=now();let limit=rates.get(userId);if(!limit||timestamp>=limit.reset){limit={count:0,reset:timestamp+60000};rates.set(userId,limit);}if(++limit.count>12)return response({code:'RATE_LIMITED',message:'Too many searches. Try again in a minute.'},429);
    if(rates.size>1000)for(const [key,value] of rates){if(timestamp>=value.reset)rates.delete(key);if(rates.size<=1000)break;}
    const cacheKey=JSON.stringify([query.toLowerCase(),language,pageToken]);const hit=cache.get(cacheKey);if(hit&&hit.expires>timestamp)return response(hit.data);
    const upstream=new URL('https://www.googleapis.com/youtube/v3/search');
    upstream.search=new URLSearchParams({key:apiKey,part:'snippet',type:'video',maxResults:'12',q:query,videoCategoryId:'10',videoEmbeddable:'true',videoSyndicated:'true',safeSearch:'moderate',regionCode:'IN',...(languageCodes[language]?{relevanceLanguage:languageCodes[language]}:{}),...(pageToken?{pageToken}:{})}).toString();
    try {
      const r=await fetcher(upstream,{signal:AbortSignal.timeout(8000)});
      if(!r.ok){if(r.status===403||r.status===429)return response({code:'SEARCH_LIMIT_OR_CONFIGURATION',message:'YouTube search is unavailable because of an API quota or configuration limit. Try the saved collection.'},503);return response({code:'PROVIDER_UNAVAILABLE',message:'YouTube search is temporarily unavailable. Try again later.'},502);}
      const body=await r.json();if(!Array.isArray(body.items))throw new Error('Invalid upstream response');
      const items=body.items.filter(item=>/^[A-Za-z0-9_-]{11}$/.test(item.id?.videoId||'')&&typeof item.snippet?.title==='string').map(item=>({videoId:item.id.videoId,title:item.snippet.title.slice(0,200),channelTitle:String(item.snippet.channelTitle||'YouTube').slice(0,100)}));
      const data={items,nextPageToken:typeof body.nextPageToken==='string'&&/^[-_A-Za-z0-9=]{1,500}$/.test(body.nextPageToken)?body.nextPageToken:null,source:'YouTube'};
      if(cache.size>=100)cache.delete(cache.keys().next().value);cache.set(cacheKey,{data,expires:timestamp+300000});return response(data);
    } catch { return response({code:'PROVIDER_UNAVAILABLE',message:'YouTube search could not be reached. Try again later.'},502); }
  };
}
export const searchMusic = createMusicSearch();
