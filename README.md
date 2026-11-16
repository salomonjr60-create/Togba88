# Togba Local

A four-page local marketing website for Togba Local.

[Open the live website](https://togbalocalhub.com/)

Pages:

- [Home](index.html)
- [Services](services.html)
- [About](about.html)
- [Journal: What Is Digital Marketing?](blog.html)
- [Journal: 10 Digital Marketing Strategies](strategies.html)
- [Contact](contact.html)
- [Privacy Policy](privacy.html)

## AI chatbot

The shared `script.js` loads the chatbot on each page. Netlify deploys its
backend from `netlify/functions/chat.js`. Set `AZURE_ENDPOINT` (the Azure
OpenAI v1 endpoint), `AZURE_API_KEY`, and `AZURE_OPENAI_MODEL` (the deployment
name) in Netlify environment variables with Functions scope, then redeploy.
Never commit API keys. The public function can incur Azure usage charges;
configure platform-level rate limiting and usage monitoring before production.
