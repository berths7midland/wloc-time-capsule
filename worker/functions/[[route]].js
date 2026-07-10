import app from "../src/index.js";

export const onRequest = ({ request, env, ctx }) => app.fetch(request, env, ctx);
