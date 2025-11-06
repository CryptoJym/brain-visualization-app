# 🧠 Brain Visualization - ACEs Trauma Assessment Platform

A web-based platform that visualizes how Adverse Childhood Experiences (ACEs) impact specific brain regions. Using evidence-based neuroscience research and AI-generated medical illustrations, this tool helps individuals understand the neurological effects of childhood trauma.

## 🌟 Core Features

### Assessment & Analysis
- **Official ACEs Questionnaire**: Standardized 10-question assessment of childhood trauma exposure
- **Brain Impact Mapping**: Maps specific traumas to affected brain regions based on neuroscience research
- **Multiple Results Views**: Choose from four different ways to view your results:
  - **Modern Results**: Clean, visual overview with key metrics
  - **Comprehensive Analysis**: Detailed breakdown of all affected brain regions
  - **Data-Focused**: Statistical and quantitative analysis
  - **Neurological Narrative**: Story-based explanation of brain impacts

### AI-Generated Brain Visualizations
- **Medical-Style Illustrations**: AI-generated side-by-side brain comparisons showing healthy vs. affected regions
- **Anatomically Accurate**: Images generated using DALL-E 3 with anatomically correct medical illustration style
- **Educational Focus**: Simple arrows and labels to help understand which brain regions are impacted

## 🛠 Technology Stack

### Core Technologies
- **React 18**: Modern UI framework with hooks
- **Vite**: Lightning-fast development and optimized builds
- **Tailwind CSS**: Utility-first styling for consistent UI/UX

### AI Integration
- **Anthropic Claude**: Powers the neurological narrative generation
- **OpenRouter / NanoBanana**: DALL-E 3 image generation for brain visualizations
- **Mem0**: Optional AI memory system for personalized content

### Build & Deployment
- **PostCSS**: CSS processing with Tailwind
- **Vercel**: Optimized deployment platform

## 📦 Installation

```bash
# Install dependencies
npm install

# Create .env file with API keys
cp .env.example .env
# Edit .env with your API keys
```

### Required API Keys

Add these to your `.env` file:

```bash
# Required for AI brain visualizations
VITE_OPENROUTER_API_KEY=your_key_here
# OR
VITE_NANOBANANA_API_KEY=your_key_here

# Required for neurological narrative
VITE_ANTHROPIC_API_KEY=your_key_here

# Optional - for personalized content
VITE_MEM0_API_KEY=your_key_here

# Image model (default: DALL-E 3)
VITE_IMAGE_MODEL=openai/dall-e-3
```

**Get API Keys:**
- OpenRouter: https://openrouter.ai/
- NanoBanana: https://nanobanana.ai/
- Anthropic: https://console.anthropic.com/
- Mem0: https://mem0.ai/

## 🚀 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Deployment

This project is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel and add your API keys as environment variables.

## 🧬 Brain Regions & Trauma Mapping

### Primary Regions Analyzed
- **Amygdala**: Threat detection, fear response, emotional memory
- **Hippocampus**: Memory consolidation, stress hormone regulation
- **Prefrontal Cortex**: Executive function, emotional regulation, decision-making
- **Anterior Cingulate Cortex**: Emotion processing, attention, social awareness
- **Insula**: Interoception, empathy, self-awareness
- **Thalamus**: Sensory relay, consciousness
- **Brain Stem**: Survival responses, autonomic functions
- **Corpus Callosum**: Inter-hemispheric communication

### Trauma-Specific Impacts
Based on neuroscience research, different types of trauma affect specific brain regions:

- **Physical Abuse**: Hyperactive amygdala, reduced prefrontal cortex volume
- **Emotional Neglect**: Reduced insula development, attachment disruption
- **Sexual Abuse**: Altered sensory processing in thalamus
- **Household Dysfunction**: HPA axis dysregulation affecting hippocampus
- **Chronic Stress**: Hippocampal volume reduction, impaired memory formation

## 📊 Results Display Modes

### 1. Modern Results
Clean, card-based layout with:
- Overall impact score
- Affected brain regions with severity indicators
- AI-generated brain visualizations
- Easy-to-understand summaries

### 2. Comprehensive Results
Detailed analysis including:
- Region-by-region breakdown
- Cascade effects across neural networks
- Specific ACE-to-region mappings
- Neurological explanations

### 3. Data-Focused Results
Quantitative analysis with:
- Statistical metrics and percentages
- Volume changes and impact scores
- Brain region coordinates (MNI space)
- Severity multipliers

### 4. Neurological Narrative
Story-based explanation:
- AI-generated narrative about your brain's adaptations
- Plain language explanations
- Contextual understanding of impacts
- Healing insights

## 🎯 Use Cases

### For Individuals
- Understand how childhood experiences affect current brain function
- Visual representation of neurological impacts
- Educational resource about trauma and the brain
- Starting point for informed conversations with healthcare providers

### For Educators & Advocates
- Teaching tool about ACEs and brain development
- Visualization aid for explaining trauma impacts
- Resource for awareness campaigns
- Evidence-based educational content

## 🔒 Privacy & Security

- **Client-Side Processing**: Assessment scoring happens in your browser
- **No Data Storage**: Your responses are never stored on our servers
- **API-Only Communication**: Only anonymized requests to AI services for image/narrative generation
- **You Own Your Data**: All assessment data stays in your browser

## ⚠️ Important Disclaimer

**This tool is for educational purposes only.** It is not a diagnostic tool and should not be used as a substitute for professional mental health assessment or treatment.

The brain visualizations are simplified illustrations meant to aid understanding - actual brain imaging (fMRI, MRI) requires medical equipment and professional interpretation.

If you're experiencing mental health challenges, please consult with a qualified healthcare provider or therapist.

## 📚 Scientific Basis

This platform is built on neuroscience research including:

- **ACEs Study** (Felitti et al., 1998) - Original Adverse Childhood Experiences research
- **"The Body Keeps the Score"** (van der Kolk) - Trauma's impact on brain and body
- **Neuroscience of Trauma** - Research on brain region changes from childhood adversity
- **MNI Coordinate System** - Standardized brain atlas for region mapping
- **Neuroplasticity Research** - Understanding the brain's capacity for healing

### Key Research Areas
- Hippocampal volume reduction in trauma exposure
- Amygdala hyperactivation in PTSD
- Prefrontal cortex development disruption
- HPA axis dysregulation from chronic stress
- Corpus callosum changes in early adversity

## 🛠 Project Structure

```
src/
├── components/
│   ├── OfficialACEsQuestionnaire.jsx       # Main assessment
│   ├── ModernResultsDisplay.jsx            # Primary results view
│   ├── ComprehensiveResultsDisplay.jsx     # Detailed analysis
│   ├── DataFocusedResults.jsx              # Statistical view
│   ├── NeurologicalNarrativeResults.jsx    # Narrative view
│   ├── ApiKeyAlert.jsx                     # API configuration help
│   └── visualization/
│       └── AIGeneratedBrainVisualization.jsx # DALL-E brain images
├── services/
│   ├── nanoBananaImageGen.js               # NanoBanana API client
│   ├── openRouterImageGen.js               # OpenRouter API client
│   └── narrativeGenerator.js               # Claude narrative generation
├── utils/
│   ├── brainRegionAtlas.js                 # Brain region database
│   ├── brainCoordinates.js                 # MNI coordinate system
│   ├── apiKeyValidator.js                  # API key validation
│   ├── demoData.js                         # Demo assessment data
│   └── designSystem.js                     # UI design system
└── data/
    └── brain_coordinates.json              # Brain region MNI data
```

## 🎨 Design System

The application uses a unified design system with:
- **Color Palette**: Purple-blue gradient theme with glass morphism
- **Typography**: Extralight headings with clear hierarchy
- **Spacing**: Consistent padding and gap system
- **Animations**: Smooth transitions and hover states
- **Responsive**: Mobile-first design that works on all devices

## 📈 Recent Updates

### November 6, 2025 - Major Cleanup
- Removed 71 unused files (59 components, 4 utilities, 2 test files, 11.5 MB assets)
- Reduced CSS bundle by 18%
- Improved build time by 6%
- Focused codebase on core functionality

### November 5, 2025 - UI/UX Unification
- Created comprehensive design system
- Unified styling across all result views
- Improved visual consistency to 95%
- Added sticky navigation with backdrop blur

### November 5, 2025 - Security & Performance
- Fixed missing Tailwind CSS configuration
- Updated dependencies and resolved security vulnerabilities
- Added API key validation and user-friendly alerts
- Simplified AI prompts for better brain image generation

## 🤝 Contributing

Contributions are welcome! Areas where help is needed:
- Improving accessibility (WCAG compliance)
- Adding internationalization (i18n)
- Enhancing mobile responsiveness
- Adding more educational content
- Improving AI prompt quality for brain visualizations

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- The neuroscience research community
- ACEs study researchers (Felitti, Anda, et al.)
- Trauma-informed care advocates
- Bessel van der Kolk and trauma research pioneers
- Open source contributors

---

## 📞 Resources & Support

**If you or someone you know needs immediate help:**
- **National Suicide Prevention Lifeline**: 988
- **Crisis Text Line**: Text HOME to 741741
- **SAMHSA National Helpline**: 1-800-662-4357
- **International Crisis Lines**: findahelpline.com

**Learn More About ACEs:**
- CDC ACEs Information: https://www.cdc.gov/violenceprevention/aces/
- ACEs Too High: https://acestoohigh.com/
- The National Child Traumatic Stress Network: https://www.nctsn.org/

**Find a Trauma-Informed Therapist:**
- Psychology Today Therapist Finder: https://www.psychologytoday.com/
- EMDR International Association: https://www.emdria.org/
- Somatic Experiencing Directory: https://directory.traumahealing.org/

---

**Built with care for trauma survivors and those seeking to understand the neuroscience of adversity.**
