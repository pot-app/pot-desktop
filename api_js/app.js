const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors()); // 使用CORS中间件
app.use(express.json());

app.post("/v1/chat/completions", (req, res) => {
  const { messages } = req.body;
  const userMessage = messages[messages.length - 1].content;
  // 这里你可以添加你自己的逻辑来生成回复
  const assistantMessage = `你刚才说的是: ${userMessage}`;
  res.json({
    id: "chatcmpl-0HgB6U3eJb8XYPYSTTRCPL4EYG6Ve",
    object: "chat.completion",
    created: 1626429675,
    model: "gpt-3.5-turbo",
    usage: {
      prompt_tokens: 56,
      completion_tokens: 31,
      total_tokens: 87,
    },
    choices: [
      {
        message: {
          role: "assistant",
          content: assistantMessage,
        },
        finish_reason: "stop",
        index: 0,
      },
    ],
  });
});

app.listen(3000, () => console.log("Server is running on port 3000"));
