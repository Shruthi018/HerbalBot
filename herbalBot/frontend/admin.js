 const API_BASE_URL = 'http://localhost:8083/api/feedback';
    let analysisChart, feedbackScores = [], showFeedbackMarkers = true;

    function createMembershipChart() {
        const ctx = document.getElementById('analysisChart').getContext('2d');
        if (analysisChart) analysisChart.destroy();

        const dataPoints = Array.from({length: 101}, (_, i) => i / 100);
        const negativeMembership = dataPoints.map(x => x <= 0.0 ? 1.0 : x <= 0.3 ? (0.3 - x) / 0.3 : 0.0);
        const neutralMembership = dataPoints.map(x => x <= 0.2 ? 0.0 : x <= 0.5 ? (x - 0.2) / 0.3 : x <= 0.8 ? (0.8 - x) / 0.3 : 0.0);
        const positiveMembership = dataPoints.map(x => x <= 0.7 ? 0.0 : x <= 1.0 ? (x - 0.7) / 0.3 : 1.0);

        const datasets = [
            { label: 'Negative (0.0-0.3)', data: negativeMembership.map((y, i) => ({x: dataPoints[i], y})), borderColor: 'rgba(244, 67, 54, 1)', borderWidth: 3, tension: 0, pointRadius: 0 },
            { label: 'Neutral (0.2-0.8)', data: neutralMembership.map((y, i) => ({x: dataPoints[i], y})), borderColor: 'rgba(255, 152, 0, 1)', borderWidth: 3, tension: 0, pointRadius: 0 },
            { label: 'Positive (0.7-1.0)', data: positiveMembership.map((y, i) => ({x: dataPoints[i], y})), borderColor: 'rgba(76, 175, 80, 1)', borderWidth: 3, tension: 0, pointRadius: 0 }
        ];

        if (showFeedbackMarkers && feedbackScores.length > 0) {
            datasets.push({
                label: 'Feedback Scores', data: feedbackScores.map(score => ({
                    x: score, y: score <= 0.3 ? (0.3 - score) / 0.3 : score <= 0.5 ? (score - 0.2) / 0.3 : score <= 0.8 ? (0.8 - score) / 0.3 : (score - 0.7) / 0.3
                })), type: 'scatter', backgroundColor: 'rgba(0, 0, 0, 0.7)', pointRadius: 5
            });
        }

        analysisChart = new Chart(ctx, {
            type: 'line', data: { datasets },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    x: { type: 'linear', position: 'bottom', title: { display: true, text: 'Sentiment Score' }, min: 0, max: 1 },
                    y: { title: { display: true, text: 'Membership Degree' }, min: 0, max: 1 }
                },
                plugins: { legend: { display: true, position: 'top' } }
            }
        });
    }

    async function loadAllFeedbackData() {
        document.getElementById('statusMessage').innerHTML = 'Loading all feedback data...';
        try {
            const response = await fetch(`${API_BASE_URL}/all-projects`);
            if (!response.ok) throw new Error(`Server returned ${response.status}`);
            const feedbacks = await response.json();
            window.feedbackData = feedbacks;
            if (feedbacks && feedbacks.length > 0) {
                feedbackScores = feedbacks.map(f => f.score || 0);
                displayFeedback(feedbacks);
                updateStatistics(feedbacks);
                createMembershipChart();
                document.getElementById('statusMessage').innerHTML = `<div class="success">✅ Loaded ${feedbacks.length} feedback items!</div>`;
            } else throw new Error('No feedback data found');
        } catch (error) {
            document.getElementById('statusMessage').innerHTML = `<div class="error">❌ Error: ${error.message}</div>`;
        }
    }

    function toggleFeedbackMarkers() { showFeedbackMarkers = !showFeedbackMarkers; createMembershipChart(); }

    function updateStatistics(feedbacks) {
        let positiveCount = 0, totalScore = 0;
        feedbacks.forEach(feedback => {
            const score = feedback.score || 0;
            totalScore += score;
            if (score >= 0.7) positiveCount++;
        });
        document.getElementById('totalFeedback').textContent = feedbacks.length;
        document.getElementById('positiveCount').textContent = positiveCount;
        document.getElementById('averageScore').textContent = feedbacks.length > 0 ? (totalScore / feedbacks.length).toFixed(2) : '0.00';
    }

    function displayFeedback(feedbacks) {
        const feedbackList = document.getElementById('feedbackList');
        if (!feedbacks || feedbacks.length === 0) {
            feedbackList.innerHTML = 'No feedback data found';
            return;
        }
        let html = '';
        feedbacks.forEach(feedback => {
            const score = feedback.score || 0;
            let sentimentClass = score >= 0.7 ? 'positive' : score >= 0.4 ? 'neutral' : 'negative';
            let sentimentText = sentimentClass === 'positive' ? 'Positive' : sentimentClass === 'neutral' ? 'Neutral' : 'Negative';
            html += `<div class="feedback-item ${sentimentClass}">
                <div><strong>${sentimentText} (Score: ${score.toFixed(2)})</strong> - Project ${feedback.projectId || 'N/A'}</div>
                <div>${feedback.feedbackText || 'No text'}</div>
            </div>`;
        });
        feedbackList.innerHTML = html;
    }

    createMembershipChart();