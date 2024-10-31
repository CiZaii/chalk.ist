export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  const response = await fetch('https://shortlink.zverify.cn/api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': '*/*',
    },
    body: JSON.stringify(body)
  });
  
  return response.json();
}); 