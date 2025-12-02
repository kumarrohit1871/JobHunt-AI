# JobHunt AI 🚀

JobHunt AI is a comprehensive web application designed to streamline the job search process using Google's Gemini 2.5 models. It helps candidates analyze their resumes, find relevant opportunities using real-time search grounding, and generate tailored application assets like cover letters and LinkedIn connection notes.

## 🌟 Key Features

*   **Resume Parsing & ATS Analysis**: Upload PDF or Image resumes to get an instant breakdown of skills, experience level, and an ATS (Applicant Tracking System) compatibility score.
*   **LinkedIn Profile Sync**: Merge your uploaded resume data with your LinkedIn profile (URL or Bio) to create a holistic professional profile.
*   **Intelligent Job Search**: Uses Google Search Grounding to find *real, active* job listings based on your inferred skills and preferences.
*   **Match Analysis**: detailed comparison between your profile and specific job descriptions, highlighting matching strengths and missing skills.
*   **Auto-Generated Application Kit**:
    *   **Tailored Cover Letters**: Unique letters generated for every specific job.
    *   **Smart Apply**: One-click "Apply via Email" with pre-filled subjects and bodies.
    *   **Networking Assistant**: Generates contextual LinkedIn connection requests to recruiters.

## 🔄 Process Flow

The application follows a linear, AI-driven data flow:

### 1. Ingestion & Analysis (The "See" Phase)
*   **Input**: User uploads a resume (PDF/Image).
*   **Process**: The file is converted to Base64 and sent to `gemini-2.5-flash`.
*   **Output**: The AI extracts structured JSON data: `Summary`, `Skills`, `Experience Level`, `ATS Score`, and `Suggested Roles`.

### 2. Profile Enrichment (The "Learn" Phase)
*   **Input**: User provides a LinkedIn URL or bio text.
*   **Process**: The app uses Gemini's **Search Grounding** tool to verify/scrape the public profile or parses the raw text.
*   **Merge**: This new data is combined with the original resume analysis to fill in gaps (e.g., recent skills not yet on the PDF).

### 3. Job Discovery (The "Search" Phase)
*   **Input**: User confirms search query (defaulting to AI-suggested roles) and location.
*   **Process**:
    1.  The app constructs a search prompt with specific filters (Experience Level, Remote/On-site).
    2.  Gemini uses the **Google Search Tool** to retrieve live job postings from the web.
    3.  Raw search results are parsed into structured `JobListing` objects.

### 4. Matching & Strategy (The "Reason" Phase)
*   **Input**: User selects a specific job card.
*   **Process**: The AI receives two contexts: The User's Profile (Resume + LinkedIn) and the Job Description.
*   **Output**:
    *   **Match Score**: A percentage indicating fit.
    *   **Gap Analysis**: Specific lists of `Strengths` vs. `Missing Skills`.
    *   **Assets**: A professionally written Cover Letter and Cold Email tailored to that specific company.

## 🛠️ Tech Stack

*   **Frontend**: React (v19), TypeScript
*   **Styling**: Tailwind CSS
*   **AI & Data**: Google GenAI SDK (`@google/genai`)
*   **Models**: `gemini-2.5-flash`
*   **Tools**: Search Grounding (for live job data)
*   **Icons**: Lucide React
*   **Visualization**: Recharts

## 🚀 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/jobhunt-ai.git
    cd jobhunt-ai
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure API Key**
    Create a `.env` file in the root directory:
    ```env
    API_KEY=your_google_genai_api_key_here
    ```
    *Note: Ensure your API key has access to the "Google Search" tool in Google AI Studio.*

4.  **Run the Application**
    ```bash
    npm start
    ```

## 🔒 Security & Privacy

*   **Client-Side Processing**: Resume files are converted to Base64 in the browser and sent directly to the Gemini API.
*   **Ephemeral Data**: No data is stored in a backend database; the session state lives in the React application memory.

## 📄 License

This project is open-source and available under the MIT License.
