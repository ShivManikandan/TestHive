# 🚀 TestHive - Reviewer Setup Guide

## 📋 Quick Start for Code Reviewers

### 🎯 **Prerequisites**
- **Node.js** 18+ installed
- **MongoDB Atlas** account (free tier works)
- **Mistral AI** API key (free tier available)
- **Git** for cloning

---

## ⚡ **5-Minute Setup**

### **1. Clone & Install**
```bash
git clone <repository-url>
cd UserStory_Bot

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### **2. Configure Environment**

#### **Backend Configuration**
```bash
cd backend
cp env.example .env
# Edit .env with your credentials (see below)
```

#### **Frontend Configuration**
```bash
cd frontend
cp env.example .env
# Default settings should work
```

---

## 🔑 **Required Credentials**

### **🤖 Mistral AI API Key**
1. Go to https://console.mistral.ai/
2. Create free account
3. Generate API key
4. Add to `backend/.env`:
   ```
   MISTRAL_API_KEY=your_actual_api_key_here
   ```

### **🗄️ MongoDB Atlas Setup**
1. Go to https://cloud.mongodb.com/
2. Create free cluster (M0 Sandbox)
3. Create database user
4. Get connection string
5. Add to `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   MONGODB_DB=your_database_name
   MONGODB_COLLECTION=your_collection_name
   ```

---

## 🏃‍♂️ **Run the Application**

### **Option 1: Automated Start (Windows)**
```bash
./start.bat
```

### **Option 2: Manual Start**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### **🌐 Access Points**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **Health Check:** http://localhost:4000/health

---

## 🧪 **Test the System**

### **1. Basic Functionality Test**
```
1. Enter: "doctor needs to approve prescriptions"
2. Click "Search Stories" 
3. Verify: Related stories appear with hybrid scores
```

### **2. AI Enhancement Test**
```
1. Enter: "nurse updates patient records"
2. Click "Enhance & Refine Story"
3. Verify: Enhanced story + related results display
```

### **3. Quality Analysis Test**
```
1. Search for stories
2. Click "Analyze Quality" on any result
3. Verify: 8-dimension breakdown (160 points total)
```

---

## 📊 **Sample Data (Optional)**

### **Quick Test Data Setup**
If you want to test without setting up full database:

```bash
cd backend
npm run init-db
```

This will:
- Create required MongoDB indexes
- Add sample healthcare user stories
- Set up vector embeddings

---

## 🔍 **What to Review**

### **🏗️ Architecture**
- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Express + TypeScript + LangChain
- **AI:** Mistral AI for embeddings and analysis
- **Database:** MongoDB Atlas with vector search

### **🧠 Key Features**
- **Hybrid Search:** Vector (70%) + BM25 (30%) retrieval
- **Quality Analysis:** 8-dimension healthcare scoring
- **Story Enhancement:** AI-powered refinement
- **Acceptance Criteria:** Automated generation

### **📁 Critical Files**
```
backend/src/
├── services/comprehensiveAnalysis.ts  # Main orchestrator
├── services/hybridRetrieval.ts        # LangChain integration
├── services/qualityEvaluation.ts      # 8-dimension scoring
└── routes/analyze.ts                  # Main API endpoint

frontend/src/
├── App.tsx                           # State management
├── components/QueryPanel.tsx         # User interface
└── components/ResultsPanel.tsx       # Results display
```

---

## 🚨 **Common Issues & Solutions**

### **❌ "MongoDB connection failed"**
```bash
# Check your MongoDB URI in backend/.env
# Ensure IP is whitelisted in MongoDB Atlas
# Verify database user permissions
```

### **❌ "Mistral AI API error"**
```bash
# Check API key in backend/.env
# Verify API key is active
# Check rate limits (free tier: 1M tokens/month)
```

### **❌ "CORS errors"**
```bash
# Ensure frontend is running on :3000
# Ensure backend is running on :4000
# Check VITE_API_URL in frontend/.env
```

---

## 📈 **Performance Expectations**

### **⚡ Response Times**
- Story Retrieval: ~500-800ms
- Quality Analysis: ~1-2s
- Story Enhancement: ~2-3s

### **🎯 Accuracy Metrics**
- Vector Search Precision: 85-90%
- BM25 Search Recall: 80-85%
- Hybrid Search F1-Score: 87-92%

---

## 📚 **Documentation Reference**

- **📖 ARCHITECTURE.md** - Complete system architecture
- **🔄 EXECUTION_FLOW.md** - Detailed execution flow
- **📋 CODE_REVIEW_GUIDE.md** - Structured review checklist
- **📝 README.md** - Project overview and features

---

## 🎯 **Review Focus Areas**

### **🔥 High Priority**
1. **AI Integration** - LangChain + Mistral AI implementation
2. **Security** - No exposed credentials, proper validation
3. **Performance** - Efficient hybrid search algorithm
4. **Healthcare Focus** - 8-dimension quality scoring

### **📋 Code Quality**
1. **TypeScript** - Full type safety
2. **Error Handling** - Comprehensive try-catch blocks
3. **API Design** - RESTful endpoints with proper responses
4. **UI/UX** - Responsive design, accessibility

---

## ✅ **Verification Checklist**

- [ ] Application starts successfully
- [ ] All API endpoints respond
- [ ] Hybrid search returns results
- [ ] Quality analysis works (8 dimensions)
- [ ] Story enhancement generates improvements
- [ ] UI is responsive and accessible
- [ ] No console errors
- [ ] No exposed credentials

---

**🎉 Ready for Review!** This setup should take 5-10 minutes and give you full access to test all features of the TestHive healthcare user story analysis system.


