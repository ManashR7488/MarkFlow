<div align="center">
  <img src="public/favicon.webp" alt="MarkFlow Icon" width="120" height="120" />
  <h1>MarkFlow | Markdown Editor</h1>
  <p><strong>A highly aesthetic, distraction-free Markdown editor designed for modern writers and developers.</strong></p>
  
  [![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg)](https://manashr7488.github.io/MarkFlow/)
  [![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg)](https://vitejs.dev/)
  [![Tailwind v4](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com/)
</div>

## 📖 Overview

MarkFlow is built on a lightning-fast React and Vite foundation with Tailwind CSS v4, offering a seamless real-time preview experience with full GitHub Flavored Markdown support. Integrated with Google's GenAI, it goes beyond standard editing by offering intelligent writing assistance—all wrapped in a sleek, minimalist dark-mode interface.

## ✨ Features

- ⚡️ **Real-time Preview:** See your Markdown rendered as you type.
- 🎨 **Minimalist Dark Mode:** A distraction-free aesthetic utilizing Tailwind CSS v4.
- 🧠 **Google GenAI Integration:** Intelligent writing assistance powered by Gemini.
- 📝 **GitHub Flavored Markdown:** Support for tables, checklists, strikethroughs, and more.
- 📊 **Live Stats:** Real-time character and word counts.
- 📄 **Export to PDF:** Easily save your documents as beautifully formatted PDFs.
- 📱 **Fully Responsive:** Smooth writing experience on both desktop and mobile.

## 🛠️ Technologies

- **Frontend Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4, Lucide React (Icons)
- **Markdown Parsing:** `react-markdown`, `remark-gfm`, `rehype-raw`
- **AI Integration:** `@google/genai`

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/manashr7488/MarkFlow.git
   cd MarkFlow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Rename `.env.example` to `.env.local` or create a new `.env.local` file in the root directory and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## 📦 Deployment

This project is configured to deploy to GitHub Pages.

To build and deploy the app, run:
```bash
npm run deploy
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---
*Powered by Google AI Studio*
