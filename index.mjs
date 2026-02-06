export const handler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({
      message: "Lambda deployed successfully 🚀",
      source: "index.mjs",
      timestamp: new Date().toISOString()
    })
  };
};
