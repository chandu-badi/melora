import { getChatGPTUser } from '../../../chatgpt-auth';
import { searchMusic } from '../../../../lib/music-search.mjs';
import { searchEnvironment } from '../../../../lib/search-runtime.mjs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const user = await getChatGPTUser();
  return searchMusic(request, searchEnvironment().apiKey, user?.userId);
}
