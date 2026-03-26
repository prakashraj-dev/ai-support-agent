import express from 'express';
import { ChatGroq } from '@langchain/groq';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { ragTool } from '../tools/ragTool.js';
import { orderTool } from '../tools/orderTool.js';
import Conversation from '../models/Conversation.js';

const router = express.Router();

const systemPrompt = `You are a helpful and friendly customer support agent for an e-commerce company.

You have access to two tools:
1. search_knowledge_base - use this for general questions about policies, shipping, returns, FAQs.
2. get_order_status - use this ONLY when the user provides an order ID like ORD-1001.

Rules:
- Always be polite and professional.
- If the user asks about order status but does not provide an order ID, ask them for it first.
- If you cannot find an answer, suggest contacting support@example.com.
- Keep responses concise and helpful.
- Do not make up information.`;

let agentExecutor = null;

async function getAgent() {
  if (agentExecutor) return agentExecutor;

  const llm = new ChatGroq({
    modelName: 'llama-3.1-8b-instant',
    temperature: 0,
    apiKey: process.env.GROQ_API_KEY,
  });

  const tools = [ragTool, orderTool];

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', systemPrompt],
    new MessagesPlaceholder('chat_history'),
    ['human', '{input}'],
    new MessagesPlaceholder('agent_scratchpad'),
  ]);

  const agent = await createOpenAIFunctionsAgent({ llm, tools, prompt });

  agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: true,
    maxIterations: 5,
  });

  return agentExecutor;
}

router.post('/', async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId and message are required' });
    }

    let conversation = await Conversation.findOne({ sessionId });
    if (!conversation) {
      conversation = new Conversation({ sessionId, messages: [] });
    }

    const recentMessages = conversation.messages.slice(-10);
    const chatHistory = recentMessages.map((msg) =>
      msg.role === 'user'
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content)
    );

    const agent = await getAgent();
    const result = await agent.invoke({
      input: message,
      chat_history: chatHistory,
    });

    const assistantReply = result.output;

    conversation.messages.push({ role: 'user', content: message });
    conversation.messages.push({ role: 'assistant', content: assistantReply });
    conversation.updatedAt = new Date();
    await conversation.save();

    res.json({
      sessionId,
      reply: assistantReply,
      messageCount: conversation.messages.length,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

router.get('/history/:sessionId', async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      sessionId: req.params.sessionId,
    });
    if (!conversation) {
      return res.json({ sessionId: req.params.sessionId, messages: [] });
    }
    res.json({
      sessionId: req.params.sessionId,
      messages: conversation.messages,
    });
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch history.' });
  }
});

export default router;