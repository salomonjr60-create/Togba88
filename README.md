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

Deploy Preview builds are skipped using `netlify.toml`; production deployments
continue normally. Existing preview URLs are not removed by this setting.

## AI chatbot

The shared `script.js` loads the chatbot on each page. Netlify deploys its
backend from `netlify/functions/chat.js`. Set `AZURE_ENDPOINT` (or
`AZURE_OPENAI_ENDPOINT`) to the Azure OpenAI v1 endpoint, `AZURE_API_KEY` (or
`AZURE_OPENAI_API_KEY`), and
`AZURE_OPENAI_MODEL` (the deployment name) in Netlify environment variables
with Functions scope, then redeploy. If both endpoint names are set,
`AZURE_ENDPOINT` takes precedence; similarly, `AZURE_API_KEY` takes precedence
over `AZURE_OPENAI_API_KEY`. Missing variable names are logged in
Netlify's function logs, without their values.
Never commit API keys. The public function can incur Azure usage charges;
configure platform-level rate limiting and usage monitoring before production.
