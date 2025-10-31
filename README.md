## 🪴 HerbalBot

### 🌿 Overview

**HerbalBot** is an intelligent chatbot designed to assist users in finding suitable herbal remedies and health advice based on symptoms and conditions.
It leverages **AI-driven logic** and **Fuzzy Logic algorithms** to provide accurate and personalized herbal suggestions.



### 🚀 Features

* 💬 **Interactive Chatbot:** Provides herbal recommendations for health concerns.
* 🌱 **AI & Fuzzy Logic Integration:** Uses `HerbalMlService` and `FeedbackFuzzyService` for decision-making.
* 🔒 **JWT Authentication:** Secure login and authorization system for users and admins.
* 🧑‍💻 **Admin Dashboard:** Allows administrators to manage herbal data, feedback, and projects.
* 💾 **Database Integration:** Stores herbs, users, feedback, and project information.
* 🎨 **Responsive Frontend:** Built using HTML, CSS, and JavaScript.



### 🧩 Tech Stack

| Layer        | Technology                           |
| ------------ | ------------------------------------ |
| **Frontend** | HTML, CSS, JavaScript                |
| **Backend**  | Java, Spring Boot                    |
| **Database** | MySQL                                |
| **Security** | JWT Authentication                   |
| **AI/ML**    | Fuzzy Logic, Machine Learning Models |



### ⚙️ Installation and Setup

#### Prerequisites

* JDK 17 or higher
* MySQL Server
* Any modern browser

#### Steps

1. Clone the repository

   git clone https://github.com/Shruthi018/HerbalBot.git
   
   cd HerbalBot/herbalBot

3. Run the application

   mvn spring-boot:run
   
4. Open `frontend/index.html` in a browser to interact with the chatbot.



### 🧠 How It Works

* The chatbot collects user input (symptoms, preferences).
* The backend applies **fuzzy logic** and **ML models** via the `HerbalMlService`.
* Results are refined based on feedback using `FeedbackFuzzyService`.
* Secure interactions are handled with JWT tokens.


