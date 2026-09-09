const express = require("express");
const authMiddleware = require("../middleware/authmid");

const router = express.Router();

/**
 * Helper to call Gemini REST API
 */
async function callGemini(prompt, systemInstruction = "") {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const payload = {
      contents: [
        {
          parts: [
            {
              text: systemInstruction ? `${systemInstruction}\n\nUser Input:\n${prompt}` : prompt,
            },
          ],
        },
      ],
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      console.warn(`Gemini API returned status ${response.status}`);
      return null;
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || null;
  } catch (err) {
    console.error("Gemini API call failed:", err.message);
    return null;
  }
}

/**
 * Smart local fallbacks in case GEMINI_API_KEY is not configured
 */
function localPolish(title, content) {
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  const bullets = lines.map((line) => {
    if (line.startsWith("-") || line.startsWith("*") || line.startsWith("#")) return line;
    return `- ${line.charAt(0).toUpperCase() + line.slice(1)}`;
  });
  return `### 📌 Key Notes: ${title || "Summary"}\n\n${bullets.join("\n")}`;
}

function localSummarize(content) {
  const sentences = content
    .replace(/\n+/g, " ")
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);
  
  if (sentences.length <= 2) {
    return content.trim();
  }
  return `${sentences.slice(0, 2).join(". ")}.`;
}

function localExtractTasks(content) {
  const actionKeywords = ["todo", "to-do", "task", "call", "buy", "check", "fix", "need to", "must", "finish", "send", "review", "email", "submit", "prepare", "meet", "schedule"];
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  const tasks = [];

  for (const line of lines) {
    const lower = line.toLowerCase();
    const isAction = actionKeywords.some((kw) => lower.includes(kw));
    if (isAction) {
      const clean = line.replace(/^[-*•\d\.\s]+/, "").trim();
      tasks.push(`- [ ] ${clean}`);
    }
  }

  if (tasks.length === 0) {
    return lines.slice(0, 3).map((l) => `- [ ] ${l.replace(/^[-*•\d\.\s]+/, "")}`).join("\n");
  }
  return tasks.join("\n");
}

/**
 * @route   POST /api/ai/polish
 * @desc    Polish and structure note content into clean markdown
 * @access  Private
 */
router.post("/polish", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!content) {
      return res.status(400).json({ msg: "Content is required" });
    }

    const systemInstruction =
      "You are an expert executive note organizer. Clean up, format, and structure the given user notes using clear Markdown headings, concise bullet points, and bold emphasis where appropriate. Return ONLY the polished markdown content without conversational filler.";

    const prompt = `Note Title: ${title || "Untitled"}\n\nContent:\n${content}`;
    const aiResult = await callGemini(prompt, systemInstruction);

    res.json({
      result: aiResult ? aiResult.trim() : localPolish(title, content),
      source: aiResult ? "gemini" : "offline_fallback",
    });
  } catch (err) {
    console.error("AI Polish error:", err);
    res.status(500).json({ msg: "Failed to polish note" });
  }
});

/**
 * @route   POST /api/ai/summarize
 * @desc    Generate a concise summary of the note
 * @access  Private
 */
router.post("/summarize", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!content) {
      return res.status(400).json({ msg: "Content is required" });
    }

    const systemInstruction =
      "Summarize the following note into 2-3 high-impact, crystal-clear sentences. Return ONLY the summary.";

    const prompt = `Title: ${title || "Untitled"}\n\nNote:\n${content}`;
    const aiResult = await callGemini(prompt, systemInstruction);

    res.json({
      summary: aiResult ? aiResult.trim() : localSummarize(content),
      source: aiResult ? "gemini" : "offline_fallback",
    });
  } catch (err) {
    console.error("AI Summarize error:", err);
    res.status(500).json({ msg: "Failed to summarize note" });
  }
});

/**
 * @route   POST /api/ai/extract-tasks
 * @desc    Extract actionable to-dos and checklists from note content
 * @access  Private
 */
router.post("/extract-tasks", authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ msg: "Content is required" });
    }

    const systemInstruction =
      "Extract all actionable tasks, to-dos, and next steps from this note. Format each item as a markdown checklist item: `- [ ] Task description`. Return ONLY the markdown checklist without conversational commentary.";

    const aiResult = await callGemini(content, systemInstruction);

    res.json({
      tasks: aiResult ? aiResult.trim() : localExtractTasks(content),
      source: aiResult ? "gemini" : "offline_fallback",
    });
  } catch (err) {
    console.error("AI Extract Tasks error:", err);
    res.status(500).json({ msg: "Failed to extract tasks" });
  }
});

module.exports = router;
