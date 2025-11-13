# Changelog

## [Unreleased] - 2025-01-13

### 🎯 Major Features

#### Story Refinement - Original Content Preservation
- **Fixed**: AI was replacing user input with unrelated healthcare examples
- **Solution**: Updated refinement prompt to strictly preserve original intent and context
- **Impact**: Refined stories now expand on what the user provides, not create new scenarios
- **Files**: `backend/src/services/storyRefinement.ts`

#### Vector Search - Flexible Configuration
- **Fixed**: Vector index name was breaking frequently
- **Solution**: Reads from `.env` file with automatic validation on startup
- **Features**:
  - Clear error messages if index name doesn't match MongoDB Atlas
  - Easy to change by updating `MONGODB_VECTOR_INDEX` in `.env`
  - Detailed validation logs on startup
- **Files**: `backend/src/services/hybridRetrieval.ts`

#### Sequential Story ID Generation
- **Fixed**: Random IDs causing duplicates
- **Solution**: Queries MongoDB for highest existing ID and increments by 1
- **Format**: HC-1, HC-2, HC-3... (sequential, no duplicates)
- **Files**: `backend/src/services/storyRefinement.ts`

### ✨ Enhancements

#### Quality Score Breakdown Display
- **Added**: Detailed 8-parameter breakdown for enhanced stories
- **Shows**: Clarity, Completeness, Acceptance Criteria, Specificity, Structure, Business Value, Testability, Technical Feasibility
- **Display**: Score for each parameter (X/20) with color coding
- **Files**: `frontend/src/App.tsx`, `frontend/src/components/ResultsPanel.tsx`

#### Complete Metadata Display
- **Added**: Full metadata display for both retrieved and enhanced stories
- **Fields**: Content, Acceptance Criteria, Priority, Risk, Status
- **Format**: Badges with color coding for quick visual identification
- **Files**: `frontend/src/components/ResultsPanel.tsx`

#### UI Theme Consistency
- **Fixed**: Accidental purple/blue colors
- **Restored**: Original amber/orange theme throughout
- **Files**: `frontend/src/components/ResultsPanel.tsx`

### 🛠️ Technical Improvements

#### Backend Services
- Enhanced prompt engineering for better content preservation
- Improved metadata extraction logic
- Added MongoDB connection pooling for ID generation
- Comprehensive logging for debugging

#### Frontend Components
- Extended interfaces to support all metadata fields
- Improved score breakdown visualization
- Better error handling and loading states

### 📝 Configuration

#### Environment Variables
- `MONGODB_VECTOR_INDEX`: Vector search index name (flexible, defaults to `vector_hybridretrieval_index`)
- Proper `.env` validation with clear error messages

### 🐛 Bug Fixes
- Fixed vector score displaying as 0% due to index name mismatch
- Fixed duplicate story IDs by implementing sequential generation
- Fixed AI generating unrelated stories by improving prompt instructions
- Fixed missing metadata fields in UI display

### 🔧 Developer Experience
- Comprehensive validation on startup
- Detailed error messages with fix instructions
- Clean separation of concerns in service layer
- TypeScript strict mode compliance

---

## How to Use

### Changing Vector Index Name
1. Go to MongoDB Atlas → Database → Search
2. Find your vector search index name
3. Update `.env`: `MONGODB_VECTOR_INDEX=your_index_name`
4. Restart backend server

### Story Enhancement
- Enter any user story (formal or informal)
- System preserves your original context
- Enhances structure, clarity, and completeness
- Generates unique sequential story ID

### Quality Scoring
- Automatic 8-parameter evaluation
- Detailed breakdown displayed in UI
- Color-coded scores for quick assessment
