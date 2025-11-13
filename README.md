# 🏥 Healthcare User Story QA Bot

A comprehensive full-stack application for healthcare user story quality assessment, retrieval, and refinement using AI-powered analysis and hybrid search capabilities.

## 🚀 Quick Start

### **🎯 For New Installations (Recommended):**
```cmd
install-and-run.bat
```
**Double-click `install-and-run.bat` for automatic setup and launch!**

### **⚡ For Already Installed Systems:**
```cmd
start.bat
```
**Double-click `start.bat` to launch both servers instantly!**

---

## 📋 Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Debugging](#debugging)
- [Reset Instructions](#reset-instructions)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## ✨ Features

### 🔍 **Smart Retrieval System**
- **Hybrid Search**: Combines vector similarity (semantic) and BM25 (keyword) search
- **Configurable Weights**: Adjust search algorithm balance with intuitive sliders
- **Healthcare-Optimized**: Specialized for HIPAA, HL7, and clinical workflows
- **Result Control**: Dynamic result count control (5-50 stories)

### 📊 **Quality Assessment Engine**
- **8-Metric Evaluation**: Comprehensive user story quality scoring (0-160 scale)
  - Clarity & Understanding
  - Completeness & Detail
  - Acceptance Criteria Quality
  - User Value & Business Impact
  - Technical Feasibility
  - Testability & Verification
  - Consistency & Standards
  - Healthcare Compliance
- **Real-time Scoring**: Instant quality feedback with detailed breakdown
- **Grade Classification**: A+ to F grading system with actionable insights

### 🤖 **AI-Powered Enhancement**
- **Story Analysis**: Deep analysis of user story components using Mistral AI
- **Acceptance Criteria Generation**: Intelligent creation of SMART acceptance criteria
- **Query Refinement**: Smart enhancement of search queries while preserving context
- **Content Preservation**: Advanced logic to maintain existing acceptance criteria during refinement

### 🎨 **Modern User Experience**
- **Intuitive Interface**: Clean, responsive design with gradient themes
- **Smart Controls**: Weight balance indicators and visual feedback
- **Reset Functionality**: One-click application reset
- **Loading States**: Comprehensive loading and error handling
- **Responsive Design**: Works seamlessly across devices

---

## 🔄 How It Works

The Healthcare User Story QA Bot uses a sophisticated 5-step pipeline to analyze, retrieve, and enhance user stories:

```
User Input (Raw Story)
        ↓
┌───────────────────────────────────────────┐
│  STEP 1: Normalization                    │
│  - Clean text formatting                  │
│  - Extract structured fields              │
│  - Convert to Agile syntax                │
│  - LLM: Mistral AI (mistral-large)        │
└───────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────┐
│  STEP 2: Embedding Generation             │
│  - Convert normalized text to vector      │
│  - Model: Mistral AI (mistral-embed)      │
│  - Output: 1024-dimensional vector        │
└───────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────┐
│  STEP 3: Hybrid Search                    │
│                                           │
│  ┌─────────────────┐  ┌────────────────┐ │
│  │ Vector Search   │  │ BM25 Search    │ │
│  │ (Semantic)      │  │ (Keywords)     │ │
│  │ MongoDB Atlas   │  │ Atlas Search   │ │
│  └─────────────────┘  └────────────────┘ │
│           ↓                    ↓          │
│  ┌─────────────────────────────────────┐ │
│  │  Score Normalization (0-1 range)    │ │
│  └─────────────────────────────────────┘ │
│           ↓                               │
│  ┌─────────────────────────────────────┐ │
│  │  Hybrid Score Calculation           │ │
│  │  score = (vector × weight_v) +      │ │
│  │          (bm25 × weight_b)          │ │
│  └─────────────────────────────────────┘ │
│           ↓                               │
│  ┌─────────────────────────────────────┐ │
│  │  Deduplication & Sorting            │ │
│  └─────────────────────────────────────┘ │
│           ↓                               │
│  ┌─────────────────────────────────────┐ │
│  │  Return Top K Stories               │ │
│  └─────────────────────────────────────┘ │
└───────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────┐
│  STEP 4: Quality Evaluation               │
│  - Analyze normalized story + related     │
│  - Score 8 dimensions (0-20 each)         │
│  - Generate detailed rationale            │
│  - LLM: Mistral AI (mistral-large)        │
└───────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────┐
│  STEP 5: Story Refinement                 │
│  - Incorporate quality feedback           │
│  - Add missing details                    │
│  - Improve clarity and structure          │
│  - Apply healthcare best practices        │
│  - LLM: Mistral AI (mistral-large)        │
└───────────────────────────────────────────┘
        ↓
Complete Analysis Result
(Normalized, Related, Evaluated, Refined)
```

### 🎯 **Process Details:**

#### **Step 1: Story Normalization**
- **Purpose**: Standardize input format and extract key components
- **Actions**: 
  - Clean text formatting and remove artifacts
  - Extract user role, goal, and benefit components
  - Convert to proper Agile user story syntax: "As a [role], I want [goal] so that [benefit]"
  - Validate story structure and completeness
- **Technology**: Mistral AI with healthcare-specific prompts

#### **Step 2: Embedding Generation** 
- **Purpose**: Convert text to numerical vectors for semantic search
- **Process**:
  - Generate 1024-dimensional embeddings using Mistral's embedding model
  - Capture semantic meaning and context relationships
  - Enable similarity matching across healthcare terminology
- **Output**: Dense vector representation optimized for healthcare content

#### **Step 3: Hybrid Retrieval Engine**
- **Vector Search**: Finds semantically similar stories using cosine similarity
- **BM25 Search**: Identifies keyword matches using traditional information retrieval
- **Score Fusion**: Combines both approaches with configurable weights (default: 70% vector, 30% BM25)
- **Ranking**: Sorts results by hybrid score, removes duplicates, returns top-K matches
- **Healthcare Optimization**: Tuned for medical terminology, procedures, and workflows

#### **Step 4: Quality Assessment**
- **8-Dimension Analysis**: Evaluates stories across healthcare-specific criteria
  - **Clarity & Understanding**: Clear, unambiguous language
  - **Completeness & Detail**: All necessary information included
  - **Acceptance Criteria**: Well-defined success conditions
  - **User Value & Business Impact**: Clear benefit articulation
  - **Technical Feasibility**: Realistic implementation scope
  - **Testability & Verification**: Measurable outcomes defined
  - **Consistency & Standards**: Adherence to healthcare standards
  - **Healthcare Compliance**: HIPAA, HL7, regulatory alignment
- **Scoring**: 0-20 points per dimension (160 total), converted to A-F grade
- **Rationale**: Detailed explanations for each score with improvement suggestions

#### **Step 5: Story Enhancement**
- **Smart Refinement**: Preserves original intent while addressing quality gaps
- **Content Preservation**: Maintains existing acceptance criteria during enhancement
- **Healthcare Context**: Adds relevant medical workflow considerations
- **Best Practices**: Applies Agile and healthcare industry standards
- **Iterative Improvement**: Builds upon quality assessment feedback

### 📊 **Example Workflow:**

```javascript
// Input
"Doctor needs to approve prescriptions quickly"

// Step 1: Normalization
"As a healthcare provider, I want to approve prescription requests efficiently 
so that patients receive timely medication access while maintaining safety protocols."

// Step 2: Embedding
[0.123, -0.456, 0.789, ...] // 1024-dimensional vector

// Step 3: Retrieval
[
  {story: "Prescription workflow automation", hybridScore: 0.89},
  {story: "Medication approval system", hybridScore: 0.85},
  // ... more related stories
]

// Step 4: Quality Analysis
{
  overallScore: 142/160,
  grade: "A-",
  dimensions: {
    clarity: 18/20,
    completeness: 16/20,
    // ... detailed breakdown
  }
}

// Step 5: Enhanced Story
"As a healthcare provider, I want to approve prescription requests through an 
integrated clinical decision support system so that I can ensure medication 
safety while reducing patient wait times and maintaining compliance with 
FDA guidelines and institutional protocols."
```

---

## 🏗️ Architecture

```
Healthcare User Story QA Bot
├── Frontend (React + TypeScript)
│   ├── Modern UI Components
│   ├── Real-time State Management
│   ├── API Integration Layer
│   └── Responsive Design System
│
├── Backend (Node.js + Express + TypeScript)
│   ├── RESTful API Endpoints
│   ├── Hybrid Retrieval Engine
│   ├── Quality Assessment Service
│   ├── AI Integration (Mistral AI)
│   └── MongoDB Integration
│
├── Data Layer
│   ├── MongoDB Atlas (Vector Storage)
│   ├── Vector Search Indexes
│   └── Mock Data Fallback
│
└── AI Services
    ├── Mistral AI (Embeddings & Analysis)
    ├── Quality Evaluation Engine
    └── Content Generation Services
```

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern component-based UI
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Modern CSS** - Gradients, animations, responsive design

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server development
- **MongoDB** - Document database with vector search
- **Mistral AI** - Advanced language models
- **CORS** - Cross-origin resource sharing

### **Development Tools**
- **TSX** - TypeScript execution engine
- **ESLint** - Code linting and quality
- **Batch Scripts** - Automated deployment
- **Environment Management** - Secure configuration

---

## 📋 Prerequisites

- **Node.js 18+** and **npm**
- **MongoDB Atlas Account** (optional - mock data available)
- **Mistral AI API Key** (optional - mock responses available)
- **Windows OS** (for batch launcher)

---

## 💻 Installation & Setup

### 1. **Clone Repository**
```bash
git clone <repository-url>
cd UserStory_Bot
```

### 2. **Install Dependencies**

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend  
npm install
```

### 3. **Environment Configuration**

**Backend Configuration** (`backend/.env`):
```bash
cd backend
copy env.example .env
```

Edit `backend/.env`:
```env
# Server Configuration
PORT=4000

# MongoDB Configuration (Optional - uses mock data if not configured)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/userstories
MONGODB_DB_NAME=userstories
MONGODB_COLLECTION_NAME=stories
MONGODB_VECTOR_INDEX_NAME=vector_index

# Mistral AI Configuration (Optional - uses mock responses if not configured)
MISTRAL_API_KEY=your_mistral_api_key_here
MISTRAL_EMBEDDING_MODEL=mistral-embed

# Optional Settings
DEFAULT_TOP_K=10
MAX_TOP_K=50
```

**Frontend Configuration** (`frontend/.env`):
```bash
cd frontend
copy env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:4000
```

---

## 🎯 Environment Configuration

### **MongoDB Setup** (Optional)
1. Create MongoDB Atlas account
2. Create cluster and database
3. Create vector search index for embeddings
4. Update `MONGODB_URI` in backend/.env

### **Mistral AI Setup** (Optional)
1. Get API key from [Mistral Console](https://console.mistral.ai/)
2. Update `MISTRAL_API_KEY` in backend/.env

> **Note**: The application works with mock data if external services aren't configured.

---

## 📖 Usage Guide

### **1. Launch Application**
```bash
# Option 1: First-time setup (auto-installs dependencies)
install-and-run.bat

# Option 2: Quick launch (after initial setup)
start.bat

# Option 3: Manual development
# Terminal 1:
cd backend && npm run dev

# Terminal 2: 
cd frontend && npm run dev
```

### **2. Access Interface**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

### **3. Using the Application**

#### **Story Retrieval:**
1. Enter healthcare-related query (e.g., "patient prescription workflow")
2. Adjust search weights using sliders
3. Set maximum results (5-50)
4. Click "Retrieve & Analyze"

#### **Quality Assessment:**
1. View 8-metric quality breakdown
2. Check overall grade (A+ to F)
3. Review detailed scoring explanations

#### **Story Enhancement:**
1. Click "Generate Acceptance Criteria" for AI-generated criteria
2. Use "Analyze & Refine Story" to improve story quality
3. Existing criteria are preserved during refinement

#### **Reset & Clear:**
1. Use "Reset" button to clear all fields
2. Use "Clear Text" to reset just the query field

> 💡 **Behind the Scenes**: Each "Retrieve & Analyze" action triggers the complete 5-step pipeline described in [How It Works](#how-it-works) - from story normalization through quality evaluation to refinement suggestions.

---

## 🔌 API Documentation

### **Health Check**
```http
GET /health
```
**Response:**
```json
{
  "status": "ok",
  "message": "TestHive API is running"
}
```

### **Story Retrieval**
```http
POST /api/retrieve
Content-Type: application/json

{
  "query": "patient prescription approval workflow",
  "vectorWeight": 0.7,
  "bm25Weight": 0.3,
  "maxResults": 10
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "story_1",
      "title": "Prescription Approval System",
      "content": "As a healthcare provider...",
      "hybridScore": 0.89,
      "vectorScore": 0.92,
      "bm25Score": 0.85,
      "qualityScore": {
        "overall": 8.5,
        "grade": "A-",
        "breakdown": {
          "clarity": 9,
          "completeness": 8,
          "acceptanceCriteria": 8,
          "userValue": 9,
          "technicalFeasibility": 8,
          "testability": 8,
          "consistency": 9,
          "compliance": 9
        }
      }
    }
  ],
  "total": 10,
  "queryAnalysis": {
    "refinedQuery": "Enhanced query...",
    "suggestions": ["suggestion1", "suggestion2"]
  }
}
```

### **Story Analysis**
```http
POST /api/analyze
Content-Type: application/json

{
  "story": "As a doctor, I want to approve prescriptions..."
}
```

### **Acceptance Criteria Generation**
```http
POST /api/generate-acceptance-criteria
Content-Type: application/json

{
  "story": "User story text...",
  "context": "Healthcare context..."
}
```

### **Query Refinement**
```http
POST /api/refine-query
Content-Type: application/json

{
  "query": "prescription workflow",
  "existingCriteria": "Previous acceptance criteria..."
}
```

---

## 🔧 Development

### **Project Structure**
```
UserStory_Bot/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Main server
│   │   ├── routes/               # API endpoints
│   │   │   ├── retrieve.ts       # Story retrieval
│   │   │   ├── analyze.ts        # Quality analysis
│   │   │   ├── refine.ts         # Query refinement
│   │   │   └── generateAcceptanceCriteria.ts
│   │   ├── services/             # Business logic
│   │   │   ├── hybridRetrieval.ts
│   │   │   ├── qualityEvaluation.ts
│   │   │   └── queryRefinement.ts
│   │   └── scripts/
│   │       └── initializeDb.ts   # Database setup
│   ├── package.json
│   ├── tsconfig.json
│   └── env.example
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Main application
│   │   ├── main.tsx             # Entry point
│   │   ├── components/          # UI components
│   │   │   ├── QueryPanel.tsx   # Input interface
│   │   │   ├── ResultsPanel.tsx # Results display
│   │   │   ├── ConfigPanel.tsx  # Settings panel
│   │   │   ├── StoryQualityPanel.tsx # Quality metrics
│   │   │   └── Header.tsx       # App header
│   │   └── services/
│   │       └── api.ts           # API client
│   ├── package.json
│   ├── vite.config.ts
│   └── env.example
│
├── start.bat                    # One-click launcher
├── README.md                    # This file
└── .gitignore
```

### **Development Commands**

**Backend:**
```bash
cd backend
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run type-check # TypeScript validation
npm run init-db    # Initialize database
```

**Frontend:**
```bash
cd frontend
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

---

## 🐛 Debugging

### **Enable Debug Mode**
1. Set environment variables:
   ```env
   NODE_ENV=development
   DEBUG=true
   ```

2. Check logs in browser console and terminal

### **Common Debug Steps**
1. **Check Health Endpoint**: `GET http://localhost:4000/health`
2. **Verify Environment Variables**: Check both `.env` files
3. **Monitor Network Tab**: Check API requests/responses
4. **Review Console Logs**: Both browser and terminal output
5. **Test API Endpoints**: Use tools like Postman or curl

### **Debug Checklist**
- [ ] Both servers running (ports 3000, 4000)
- [ ] Environment files configured
- [ ] Network connectivity
- [ ] API keys valid (if using external services)
- [ ] Dependencies installed
- [ ] No port conflicts

---

## 🔄 Reset Instructions

### **Application Reset**
1. **UI Reset**: Click "Reset" button in interface
2. **Full Application Reset**: Restart using `start.bat`
3. **Development Reset**: Restart both servers manually

### **Environment Reset**
1. **Restore Default Config**:
   ```bash
   # Backend
   cd backend && copy env.example .env
   
   # Frontend  
   cd frontend && copy env.example .env
   ```

2. **Clear Cache**:
   ```bash
   # Backend
   cd backend && npm run build
   
   # Frontend
   cd frontend && rm -rf dist && npm run build
   ```

### **Database Reset** (if using MongoDB)
1. Clear collections in MongoDB Atlas
2. Reinitialize: `npm run init-db` in backend
3. Restart application

---

## 🚨 Troubleshooting

### **Port Issues**
**Problem**: Ports 3000/4000 already in use
**Solution**:
```bash
# Kill processes on ports
taskkill /f /im node.exe
# Or change ports in .env files
```

### **Environment Variable Issues**
**Problem**: API keys not working
**Solution**:
1. Verify `.env` files exist and are configured
2. Check for trailing spaces or quotes
3. Restart servers after changes
4. Use mock mode if external services unavailable

### **MongoDB Connection Issues**
**Problem**: Database connection failing
**Solution**:
1. Check `MONGODB_URI` format and credentials
2. Verify network connectivity
3. Use mock data mode for development
4. Check MongoDB Atlas firewall settings

### **Build Issues**
**Problem**: TypeScript compilation errors
**Solution**:
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Type checking
npm run type-check
```

### **Performance Issues**
**Problem**: Slow API responses
**Solution**:
1. Check network connectivity
2. Monitor API rate limits
3. Use smaller result sets
4. Enable result caching

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📞 Support

For issues or questions:
1. Check this README and troubleshooting section
2. Review console logs for error details
3. Test with mock data to isolate issues
4. Create detailed issue report with logs

---

**🎯 Ready to analyze healthcare user stories with AI-powered quality assessment!**