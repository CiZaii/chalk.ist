export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  try {
    const response = await fetch('https://shortlink.wl.do/api', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'accept-language': 'zh-CN,zh;q=0.9',
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        'pragma': 'no-cache',
        'priority': 'u=1, i',
        'sec-ch-ua': '"Not?A_Brand";v="99", "Chromium";v="130"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'Referer': 'https://shortlink.zverify.cn/',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      },
      body: JSON.stringify(body)
    });
    
    return response.json();
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: '生成短链接失败'
    });
  }
}); 