// ============================================
// GEOMETRY CONSTRUCTION TOOL - MAIN SCRIPT
// ============================================

// Grid and measurement constants
const GRID_SPACING = 25; // pixels per grid box
const CM_PER_BOX = 1; // 1 cm per grid box
const PIXELS_PER_CM = GRID_SPACING / CM_PER_BOX; // conversion factor

// State Management
const state = {
    currentConcept: 'angles',
    angle: 45,
    currentTool: 'line',
    construction: [],
    perpPoints: [],
    parallelLines: 1,
    quizIndex: 0,
    quizScore: 0,
};

// Quiz Questions
const quizQuestions = [
    {
        question: 'What is an acute angle?',
        options: [
            { text: 'An angle between 0° and 90°', correct: true },
            { text: 'An angle exactly 90°', correct: false },
            { text: 'An angle between 90° and 180°', correct: false },
            { text: 'An angle greater than 180°', correct: false }
        ]
    },
    {
        question: 'What does the symbol ⊥ represent?',
        options: [
            { text: 'Parallel lines', correct: false },
            { text: 'Perpendicular lines', correct: true },
            { text: 'Equal angles', correct: false },
            { text: 'Intersecting lines', correct: false }
        ]
    },
    {
        question: 'At what angle do perpendicular lines intersect?',
        options: [
            { text: '45°', correct: false },
            { text: '60°', correct: false },
            { text: '90°', correct: true },
            { text: '180°', correct: false }
        ]
    },
    {
        question: 'What is an obtuse angle?',
        options: [
            { text: 'An angle between 0° and 90°', correct: false },
            { text: 'An angle exactly 90°', correct: false },
            { text: 'An angle between 90° and 180°', correct: true },
            { text: 'An angle exactly 180°', correct: false }
        ]
    },
    {
        question: 'Parallel lines ______.',
        options: [
            { text: 'Always intersect', correct: false },
            { text: 'Never intersect and maintain equal distance', correct: true },
            { text: 'Intersect at 90°', correct: false },
            { text: 'Sometimes intersect', correct: false }
        ]
    }
];

// ============================================
// CONVERSION UTILITIES
// ============================================

function pixelsToCm(pixels) {
    return (pixels / PIXELS_PER_CM).toFixed(2);
}

function formatMeasurement(pixels, label = 'AB') {
    const cm = pixelsToCm(pixels);
    return `${label} = ${cm} cm`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setupMenuListeners();
    setupAngleControls();
    setupPerpendicularControls();
    setupParallelControls();
    setupConstructionControls();
    setupQuizControls();
    drawAngle();
    drawPerpendicular();
    drawParallel();
    updateConceptInfo();
});

// ============================================
// MENU AND NAVIGATION
// ============================================

function setupMenuListeners() {
    const menuBtns = document.querySelectorAll('.menu-btn');
    menuBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const concept = e.target.dataset.concept;
            switchConcept(concept);
        });
    });
}

function switchConcept(concept) {
    // Update active menu button
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-concept="${concept}"]`).classList.add('active');

    // Update active section
    document.querySelectorAll('.concept-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(concept).classList.add('active');

    state.currentConcept = concept;
    updateConceptInfo();

    // Initialize concept-specific canvas
    setTimeout(() => {
        if (concept === 'angles') drawAngle();
        else if (concept === 'perpendicular') drawPerpendicular();
        else if (concept === 'parallel') drawParallel();
        else if (concept === 'construction') drawConstruction();
        else if (concept === 'quiz') initializeQuiz();
    }, 100);
}

function updateConceptInfo() {
    const conceptInfo = {
        angles: '<strong>Angles</strong> are formed by two rays sharing a common endpoint. Learn about different angle types by adjusting the slider.',
        perpendicular: '<strong>Perpendicular lines</strong> intersect at exactly 90°, marked with the symbol ⊥. They are fundamental in geometry.',
        parallel: '<strong>Parallel lines</strong> never intersect and always maintain the same distance apart, marked with ∥.',
        construction: '<strong>Geometric construction</strong> is the art of drawing geometric figures using specific tools and methods. Each grid box = 1 cm.',
        quiz: 'Test your knowledge about angles, perpendiculars, and parallel lines with this quick quiz!'
    };

    document.getElementById('concept-info').innerHTML = conceptInfo[state.currentConcept];
}

// ============================================
// ANGLE CONCEPT
// ============================================

function setupAngleControls() {
    const slider = document.getElementById('angle-slider');
    const resetBtn = document.getElementById('reset-angle');

    slider.addEventListener('input', (e) => {
        state.angle = parseFloat(e.target.value);
        document.getElementById('angle-display').textContent = state.angle.toFixed(0);
        updateAngleInfo();
        drawAngle();
    });

    resetBtn.addEventListener('click', () => {
        state.angle = 45;
        slider.value = 45;
        document.getElementById('angle-display').textContent = '45';
        updateAngleInfo();
        drawAngle();
    });

    // Angle card clicks
    document.querySelectorAll('.angle-card').forEach(card => {
        card.addEventListener('click', () => {
            const angle = parseFloat(card.dataset.angle);
            state.angle = angle;
            slider.value = angle;
            document.getElementById('angle-display').textContent = angle.toFixed(0);
            updateAngleInfo();
            drawAngle();
        });
    });
}

function updateAngleInfo() {
    const angle = state.angle;
    let type = '';
    let description = '';

    if (angle < 90) {
        type = 'Acute Angle';
        description = 'This is an angle between 0° and 90°';
    } else if (angle === 90) {
        type = 'Right Angle';
        description = 'This is exactly 90°, the angle formed by perpendicular lines';
    } else if (angle < 180) {
        type = 'Obtuse Angle';
        description = 'This is an angle between 90° and 180°';
    } else if (angle === 180) {
        type = 'Straight Angle';
        description = 'This is exactly 180°, forming a straight line';
    } else if (angle < 360) {
        type = 'Reflex Angle';
        description = 'This is an angle between 180° and 360°';
    } else {
        type = 'Full Rotation';
        description = 'This is exactly 360°, a complete rotation';
    }

    document.getElementById('angle-type').innerHTML = `Type: <strong>${type}</strong>`;
    document.getElementById('angle-description').textContent = description;
}

function drawAngle() {
    const canvas = document.getElementById('angleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 150;
    const arcRadius = 70;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw reference lines
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.stroke();

    // Draw origin point
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw first ray (0°)
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.stroke();

    // Draw second ray (angle)
    const radians = (state.angle * Math.PI) / 180;
    ctx.strokeStyle = '#764ba2';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
        centerX + radius * Math.cos(radians),
        centerY - radius * Math.sin(radians)
    );
    ctx.stroke();

    // Draw the angle arc between the two rays, inside the angle
    ctx.strokeStyle = '#ff6b6b';
    ctx.fillStyle = 'rgba(255, 107, 107, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, arcRadius, 0, -radians, false);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    // Add angle label inside the arc
    const labelAngle = -radians / 2;
    const labelX = centerX + (arcRadius + 22) * Math.cos(labelAngle);
    const labelY = centerY + (arcRadius + 22) * Math.sin(labelAngle);
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(state.angle.toFixed(0) + '°', labelX, labelY);

    // Draw labels
    ctx.fillStyle = '#667eea';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('0°', centerX + radius + 10, centerY + 5);

    ctx.fillStyle = '#764ba2';
    ctx.fillText(`${state.angle.toFixed(0)}°`, 
        centerX + radius * Math.cos(radians) + 10,
        centerY - radius * Math.sin(radians) - 10
    );
}

// ============================================
// PERPENDICULAR LINES CONCEPT
// ============================================

function setupPerpendicularControls() {
    const constructBtn = document.getElementById('construct-perpendicular');
    const resetBtn = document.getElementById('reset-perpendicular');
    const canvas = document.getElementById('perpendicularCanvas');

    constructBtn.addEventListener('click', () => {
        state.perpPoints = [];
        drawPerpendicular();
    });

    resetBtn.addEventListener('click', () => {
        state.perpPoints = [];
        drawPerpendicular();
    });

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        state.perpPoints.push({ x, y });
        drawPerpendicular();
    });
}

function drawPerpendicular() {
    const canvas = document.getElementById('perpendicularCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw base line
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(50, 250);
    ctx.lineTo(450, 250);
    ctx.stroke();

    // Draw point if selected
    if (state.perpPoints.length > 0) {
        const point = state.perpPoints[0];
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw perpendicular line
        ctx.strokeStyle = '#764ba2';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(point.x, 100);
        ctx.lineTo(point.x, 400);
        ctx.stroke();

        // Draw right angle symbol
        drawRightAngleSymbol(ctx, point.x, 250, 20);
    }

    // Draw instruction
    ctx.fillStyle = '#666';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Click on the line to place a point', canvas.width / 2, 50);
}

function drawRightAngleSymbol(ctx, x, y, size) {
    ctx.strokeStyle = '#ff6b6b';
    ctx.fillStyle = 'rgba(255, 107, 107, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - size, y - size);
    ctx.lineTo(x - size, y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.fill();
}

// ============================================
// PARALLEL LINES CONCEPT
// ============================================

function setupParallelControls() {
    const addBtn = document.getElementById('add-parallel-line');
    const resetBtn = document.getElementById('reset-parallel');

    addBtn.addEventListener('click', () => {
        state.parallelLines = Math.min(state.parallelLines + 1, 5);
        drawParallel();
    });

    resetBtn.addEventListener('click', () => {
        state.parallelLines = 1;
        drawParallel();
    });
}

function drawParallel() {
    const canvas = document.getElementById('parallelCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const lineSpacing = GRID_SPACING * 3.2; // 80 pixels = 3.2 cm spacing
    const startY = 250 - (state.parallelLines * lineSpacing) / 2;

    // Draw parallel lines
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;

    for (let i = 0; i < state.parallelLines; i++) {
        const y = startY + i * lineSpacing;
        ctx.beginPath();
        ctx.moveTo(50, y);
        ctx.lineTo(450, y);
        ctx.stroke();

        // Label with parallel symbol
        ctx.fillStyle = '#667eea';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('∥', 20, y + 5);
    }

    // Draw measurements showing equal distance
    if (state.parallelLines > 1) {
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);

        for (let i = 0; i < state.parallelLines - 1; i++) {
            const y1 = startY + i * lineSpacing;
            const y2 = startY + (i + 1) * lineSpacing;
            const midY = (y1 + y2) / 2;

            ctx.beginPath();
            ctx.moveTo(480, y1);
            ctx.lineTo(480, y2);
            ctx.stroke();

            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            const distanceCm = pixelsToCm(lineSpacing);
            ctx.fillText(`${distanceCm} cm`, 485, midY);
        }

        ctx.setLineDash([]);
    }

    // Draw instruction
    ctx.fillStyle = '#666';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.setLineDash([]);
    ctx.fillText(`${state.parallelLines} parallel line${state.parallelLines > 1 ? 's' : ''}`, canvas.width / 2, 50);
}

// ============================================
// CONSTRUCTION TOOL
// ============================================

function setupConstructionControls() {
    const lineTool = document.getElementById('tool-line');
    const circleTool = document.getElementById('tool-circle');
    const angleTool = document.getElementById('tool-angle');
    const clearBtn = document.getElementById('clear-canvas');
    const canvas = document.getElementById('constructionCanvas');

    [lineTool, circleTool, angleTool].forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.currentTool = e.target.id.replace('tool-', '');
            drawConstruction();
        });
    });

    clearBtn.addEventListener('click', () => {
        state.construction = [];
        drawConstruction();
    });

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        addConstructionElement(x, y);
    });
}

function addConstructionElement(x, y) {
    const tool = state.currentTool;

    if (tool === 'line') {
        if (!state.construction.linePoints) state.construction.linePoints = [];
        state.construction.linePoints.push({ x, y });
        if (state.construction.linePoints.length === 2) {
            state.construction.lines = state.construction.lines || [];
            const p1 = state.construction.linePoints[0];
            const p2 = state.construction.linePoints[1];
            const length = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            state.construction.lines.push({
                start: p1,
                end: p2,
                length,
                label: formatMeasurement(length, 'AB')
            });
            state.construction.linePoints = [];
        }
    } else if (tool === 'circle') {
        if (!state.construction.circleStart) {
            state.construction.circleStart = { x, y };
        } else {
            const radius = Math.sqrt(
                Math.pow(x - state.construction.circleStart.x, 2) +
                Math.pow(y - state.construction.circleStart.y, 2)
            );
            state.construction.circles = state.construction.circles || [];
            state.construction.circles.push({
                x: state.construction.circleStart.x,
                y: state.construction.circleStart.y,
                r: radius,
                label: `r = ${pixelsToCm(radius)} cm`
            });
            state.construction.circleStart = null;
        }
    } else if (tool === 'angle') {
        state.construction.angles = state.construction.angles || [];
        state.construction.angles.push({ x, y });
    }

    drawConstruction();
}

function drawConstruction() {
    const canvas = document.getElementById('constructionCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += GRID_SPACING) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    // Draw lines
    if (state.construction.lines) {
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 3;
        state.construction.lines.forEach(line => {
            ctx.beginPath();
            ctx.moveTo(line.start.x, line.start.y);
            ctx.lineTo(line.end.x, line.end.y);
            ctx.stroke();

            // Draw line length label around midpoint
            const midpointX = (line.start.x + line.end.x) / 2;
            const midpointY = (line.start.y + line.end.y) / 2;
            ctx.fillStyle = '#4e4e4e';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(line.label, midpointX, midpointY - 12);
        });
    }

    // Draw circles
    if (state.construction.circles) {
        ctx.strokeStyle = '#764ba2';
        ctx.lineWidth = 3;
        state.construction.circles.forEach(circle => {
            ctx.beginPath();
            ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
            ctx.stroke();

            // Draw radius label near circle edge
            ctx.fillStyle = '#764ba2';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(circle.label, circle.x + circle.r + 8, circle.y + 5);
        });
    }

    // Draw angle markers
    if (state.construction.angles) {
        ctx.fillStyle = '#ff6b6b';
        state.construction.angles.forEach(angle => {
            ctx.beginPath();
            ctx.arc(angle.x, angle.y, 8, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // Draw live line points
    if (state.construction.linePoints && state.construction.linePoints.length > 0) {
        ctx.fillStyle = '#2ecc71';
        state.construction.linePoints.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    if (state.construction.circleStart) {
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.arc(state.construction.circleStart.x, state.construction.circleStart.y, 6, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw instruction
    ctx.fillStyle = '#666';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    const instructions = {
        line: 'Click two points to draw a line',
        circle: 'Click center, then edge to draw a circle',
        angle: 'Click to mark angles'
    };
    ctx.fillText(instructions[state.currentTool], canvas.width / 2, 30);
}

// ============================================
// QUIZ
// ============================================

function setupQuizControls() {
    const nextBtn = document.getElementById('next-question');
    const restartBtn = document.getElementById('restart-quiz');

    nextBtn.addEventListener('click', loadNextQuestion);
    restartBtn.addEventListener('click', initializeQuiz);
}

function initializeQuiz() {
    state.quizIndex = 0;
    state.quizScore = 0;
    loadQuestion();
}

function loadQuestion() {
    if (state.quizIndex >= quizQuestions.length) {
        showQuizResults();
        return;
    }

    const question = quizQuestions[state.quizIndex];
    document.getElementById('quiz-question').textContent = question.question;
    document.getElementById('current-question').textContent = state.quizIndex + 1;
    document.getElementById('total-questions').textContent = quizQuestions.length;
    document.getElementById('progress-fill').style.width = 
        ((state.quizIndex + 1) / quizQuestions.length) * 100 + '%';

    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const div = document.createElement('div');
        div.className = 'quiz-option';
        div.textContent = option.text;
        div.addEventListener('click', () => selectAnswer(index, option.correct));
        optionsContainer.appendChild(div);
    });

    document.getElementById('quiz-feedback').classList.remove('show');
    document.getElementById('next-question').style.display = 'none';
}

function selectAnswer(index, correct) {
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(opt => opt.style.pointerEvents = 'none');

    const feedback = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('next-question');

    options[index].classList.add(correct ? 'correct' : 'incorrect');

    feedback.classList.add('show');
    feedback.classList.toggle('correct', correct);
    feedback.classList.toggle('incorrect', !correct);

    if (correct) {
        state.quizScore++;
        feedback.textContent = '✓ Correct!';
    } else {
        const correctIndex = quizQuestions[state.quizIndex].options.findIndex(opt => opt.correct);
        options[correctIndex].classList.add('correct');
        feedback.textContent = '✗ Incorrect. The correct answer is highlighted.';
    }

    nextBtn.style.display = 'block';
}

function loadNextQuestion() {
    state.quizIndex++;
    loadQuestion();
}

function showQuizResults() {
    const score = state.quizScore;
    const total = quizQuestions.length;
    const percentage = (score / total) * 100;

    const container = document.getElementById('quiz-question').parentElement;
    container.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <h2 style="color: #667eea; margin-bottom: 20px;">Quiz Complete!</h2>
            <div style="font-size: 3em; color: #2ecc71; margin: 20px 0;">${score}/${total}</div>
            <p style="font-size: 1.2em; color: #666; margin-bottom: 20px;">
                You scored <strong>${percentage.toFixed(0)}%</strong>
            </p>
            ${percentage === 100 ? '<p style="font-size: 1.1em; color: #2ecc71;">🎉 Perfect score! Excellent work!</p>' :
              percentage >= 80 ? '<p style="font-size: 1.1em; color: #2ecc71;">Great job! Keep practicing!</p>' :
              percentage >= 60 ? '<p style="font-size: 1.1em; color: #ffa500;">Good effort! Review the concepts and try again.</p>' :
              '<p style="font-size: 1.1em; color: #ff6b6b;">Keep learning! Go through the concepts and try again.</p>'}
        </div>
    `;

    document.getElementById('next-question').style.display = 'none';
    document.getElementById('restart-quiz').style.display = 'block';
    document.getElementById('quiz-options').innerHTML = '';
}
