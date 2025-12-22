# 📋 Course Grabber Template Guide

Use this guide to generate course structures using AI (ChatGPT, Claude, Gemini, etc.) that can be directly imported into Course Grabber.

## Standard JSON Schema

This is the "pre-approved" format Course Grabber understands.

```json
{
  "name": "Course Name Here",
  "lessons": [
    "01. Introduction",
    "02. Getting Started",
    "03. Advanced Topics"
  ]
}
```

## 🤖 AI Prompt Template

Copy and paste the following prompt into your LLM to generate a valid course template:

---

**Prompt:**

```text
I need to structure a video course for: [INSERT COURSE TOPIC HERE]

Please generate a course structure and output it strictly in the following JSON format for the "Course Grabber" application. Do not include markdown formatting or backticks, just the raw JSON.

Structure requirements:
- "name": A concise name for the project.
- "lessons": An array of strings, where each string is a lesson title (numbered if possible).

JSON Template:
{
  "name": "Course Title",
  "lessons": [
    "Module 1: Title",
    "Module 2: Title"
  ]
}
```

---

## How to Use

1.  **Generate**: Paste the prompt above into ChatGPT/Claude with your topic.
2.  **Copy**: Copy the JSON output.
3.  **Import**:
    *   Open Course Grabber Desktop.
    *   Click **New Project**.
    *   Select **Import Template**.
    *   Paste the JSON.
    *   Click **Create**.
