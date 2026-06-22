// ConnectSphere - Social Network Friend Recommendation System
// Application Logic & Interactivity

// 1. Data Model
// User profiles database with realistic avatars, skills, locations and predefined friendships
const users = [
    {
        id: "rahul",
        name: "Rahul Sharma",
        skills: ["Java", "Python"],
        city: "Hyderabad",
        avatarSeed: "rahul",
        friends: ["priya", "arjun", "neha"]
    },
    {
        id: "priya",
        name: "Priya Reddy",
        skills: ["Python", "AI"],
        city: "Hyderabad",
        avatarSeed: "priya",
        friends: ["rahul", "sneha", "kiran"]
    },
    {
        id: "arjun",
        name: "Arjun Kumar",
        skills: ["JavaScript", "Web Development"],
        city: "Bangalore",
        avatarSeed: "arjun",
        friends: ["rahul", "neha"]
    },
    {
        id: "sneha",
        name: "Sneha Patel",
        skills: ["AI", "Machine Learning", "Python"], // Added Python to ensure Python is a common skill match with Rahul
        city: "Hyderabad",
        avatarSeed: "sneha",
        friends: ["priya", "kiran"]
    },
    {
        id: "kiran",
        name: "Kiran Verma",
        skills: ["Python", "Data Science"],
        city: "Chennai",
        avatarSeed: "kiran",
        friends: ["priya", "sneha"]
    },
    {
        id: "neha",
        name: "Neha Singh",
        skills: ["Java", "Data Science"],
        city: "Bangalore",
        avatarSeed: "neha",
        friends: ["rahul", "arjun"]
    }
];

// Helper to get initials for avatars
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('');
}

// Helper to get avatar color based on name length/hash
function getAvatarColor(name) {
    const colors = [
        'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', // Indigo to Purple
        'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)', // Pink to Rose
        'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)', // Sky to Blue
        'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Emerald to Green
        'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Amber to Orange
        'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)'  // Lime to Green
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

// 2. Recommendation Engine Logic
// Recommendation Score = Mutual Friends * 60 + Common Skills * 20 + Same City * 20
function getRecommendations(sourceUserId) {
    const sourceUser = users.find(u => u.id === sourceUserId);
    if (!sourceUser) return [];

    const recommendations = [];

    users.forEach(targetUser => {
        // Must not be the same user and must not already be friends
        if (targetUser.id === sourceUser.id || sourceUser.friends.includes(targetUser.id)) {
            return;
        }

        // Mutual Friends intersection
        const mutualFriends = sourceUser.friends.filter(friendId => targetUser.friends.includes(friendId));
        
        // Common Skills intersection
        const commonSkills = sourceUser.skills.filter(skill => targetUser.skills.includes(skill));

        // Same City match
        const sameCity = sourceUser.city.toLowerCase() === targetUser.city.toLowerCase();

        // Calculate score
        const mutualScore = mutualFriends.length * 60;
        const skillsScore = commonSkills.length * 20;
        const cityScore = sameCity ? 20 : 0;
        const totalScore = mutualScore + skillsScore + cityScore;

        recommendations.push({
            user: targetUser,
            mutualFriends: mutualFriends,
            commonSkills: commonSkills,
            sameCity: sameCity,
            scoreBreakdown: {
                mutual: mutualScore,
                skills: skillsScore,
                city: cityScore
            },
            score: totalScore
        });
    });

    // Sort by recommendation score descending
    return recommendations.sort((a, b) => b.score - a.score);
}

// 3. UI Rendering & Interactions
function initApp() {
    populateUserSelector();
    renderUserDirectory();
    updateDashboardStats();
    
    // Default recommendation view on load
    handleGetRecommendations();

    // Event Listeners
    document.getElementById('btn-get-recommendations').addEventListener('click', handleGetRecommendations);
    document.getElementById('user-selector').addEventListener('change', updateSelectedPreview);
    document.getElementById('btn-reset-graph').addEventListener('click', () => {
        resetGraphLayout();
    });

    // Navigation links handling
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Initialize Network Graph
    initNetworkGraph();
}

// Populate the profile dropdown
function populateUserSelector() {
    const selector = document.getElementById('user-selector');
    selector.innerHTML = '';
    
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name} (${user.city})`;
        selector.appendChild(option);
    });

    updateSelectedPreview();
}

// Update the user card shown right below the selector dropdown
function updateSelectedPreview() {
    const selector = document.getElementById('user-selector');
    const selectedId = selector.value;
    const user = users.find(u => u.id === selectedId);
    
    const previewDiv = document.getElementById('selected-user-preview');
    
    if (user) {
        previewDiv.classList.remove('hidden');
        previewDiv.innerHTML = `
            <div class="user-avatar-sm" style="background: ${getAvatarColor(user.name)}">
                ${getInitials(user.name)}
            </div>
            <div class="selected-user-info">
                <h4>${user.name}</h4>
                <p><i class="fa-solid fa-location-dot"></i> ${user.city} | ${user.skills.join(', ')}</p>
            </div>
        `;
    } else {
        previewDiv.classList.add('hidden');
    }
}

// Process and display friendship suggestions
function handleGetRecommendations() {
    const selector = document.getElementById('user-selector');
    const selectedId = selector.value;
    const recommendations = getRecommendations(selectedId);
    
    const container = document.getElementById('recommendations-container');
    const countBadge = document.getElementById('results-count');
    
    countBadge.textContent = `${recommendations.length} recommendations found`;
    
    if (recommendations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-user-slash"></i>
                <p>No new recommendations available for this user.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    recommendations.forEach(rec => {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        
        const commonSkillsText = rec.commonSkills.length > 0 ? rec.commonSkills.join(', ') : 'None';
        const cityMatchText = rec.sameCity ? 'Yes' : 'No';
        
        card.innerHTML = `
            <div class="rec-user-meta">
                <div class="user-avatar-sm" style="background: ${getAvatarColor(rec.user.name)}">
                    ${getInitials(rec.user.name)}
                </div>
                <div class="rec-details">
                    <h4>${rec.user.name}</h4>
                    <p>
                        <span><i class="fa-solid fa-user-group"></i> Mutual: <strong>${rec.mutualFriends.length}</strong></span>
                        <span><i class="fa-solid fa-code"></i> Skills: <strong>${commonSkillsText}</strong></span>
                        <span><i class="fa-solid fa-building-user"></i> Same City: <strong>${cityMatchText}</strong></span>
                    </p>
                </div>
            </div>
            <div class="score-badge">
                <div class="score-number">${rec.score}</div>
                <div class="score-label">Match Score</div>
            </div>
        `;
        container.appendChild(card);
    });

    // Update active node in the graph visualization
    activeGraphNodeId = selectedId;
    if (drawGraph) drawGraph();
}

// Render the profiles list cards in the bottom directory
function renderUserDirectory() {
    const grid = document.getElementById('profiles-grid');
    grid.innerHTML = '';

    users.forEach(user => {
        const card = document.createElement('div');
        card.className = 'glass-card profile-card';
        
        const skillsBadges = user.skills.map(s => `<span class="skill-tag">${s}</span>`).join('');
        const friendNames = user.friends.map(fId => {
            const friend = users.find(u => u.id === fId);
            return friend ? `<span class="friend-bubble">${friend.name.split(' ')[0]}</span>` : '';
        }).join('');

        card.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar" style="background: ${getAvatarColor(user.name)}">
                    ${getInitials(user.name)}
                </div>
                <div class="profile-meta">
                    <h3>${user.name}</h3>
                    <div class="profile-location">
                        <i class="fa-solid fa-location-dot"></i> ${user.city}
                    </div>
                </div>
            </div>
            <div class="profile-skills-title">Technical Skills</div>
            <div class="skills-tags">
                ${skillsBadges}
            </div>
            <div class="profile-friends-title">Connections</div>
            <div class="profile-friends-list">
                ${friendNames}
            </div>
        `;
        grid.appendChild(card);
    });
}

// Computes statistics totals
function updateDashboardStats() {
    document.getElementById('stat-total-users').textContent = users.length;
    
    // Friendships (since graph is undirected, total connections is sum of all friends list divided by 2)
    let connectionCount = 0;
    users.forEach(u => connectionCount += u.friends.length);
    const totalFriendships = connectionCount / 2;
    document.getElementById('stat-total-friendships').textContent = totalFriendships;

    // Potential Recommendations
    // Calculate total missing graph edges
    let totalRecommendations = 0;
    for (let i = 0; i < users.length; i++) {
        for (let j = i + 1; j < users.length; j++) {
            const u1 = users[i];
            const u2 = users[j];
            if (!u1.friends.includes(u2.id)) {
                totalRecommendations++;
            }
        }
    }
    document.getElementById('stat-total-recommendations').textContent = totalRecommendations;
}

// 4. Interactive Social Graph Visualizer (Canvas implementation)
let canvas, ctx;
let graphNodes = [];
let activeGraphNodeId = 'rahul';
let hoveredNode = null;
let draggedNode = null;
let drawGraph;

function initNetworkGraph() {
    canvas = document.getElementById('network-canvas');
    ctx = canvas.getContext('2d');

    // Handle canvas resizing
    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    resizeCanvas();
    window.addEventListener('resize', () => {
        resizeCanvas();
        if (drawGraph) drawGraph();
    });

    // Create node positions in circular layout initially
    resetGraphLayout();

    // Event Listeners for Dragging & Hovering
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Dynamic animation loop for physics/rendering
    function animate() {
        updatePhysics();
        drawGraph();
        requestAnimationFrame(animate);
    }
    animate();
}

function resetGraphLayout() {
    if (!canvas) return;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.35;

    graphNodes = users.map((user, idx) => {
        const angle = (idx / users.length) * Math.PI * 2;
        return {
            id: user.id,
            name: user.name,
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            vx: 0,
            vy: 0,
            radius: 28,
            color: getAvatarColor(user.name)
        };
    });
}

function updatePhysics() {
    if (draggedNode) return; // Disable physics updates for dragged node

    const springLength = 160;
    const kSpring = 0.02;     // spring constant
    const kRepel = 800;       // repulsion constant
    const damping = 0.85;

    // 1. Repulsion between all pairs of nodes
    for (let i = 0; i < graphNodes.length; i++) {
        const n1 = graphNodes[i];
        for (let j = i + 1; j < graphNodes.length; j++) {
            const n2 = graphNodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;

            if (dist < 300) {
                const force = kRepel / (dist * dist);
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;

                n1.vx -= fx;
                n1.vy -= fy;
                n2.vx += fx;
                n2.vy += fy;
            }
        }
    }

    // 2. Attraction between connected nodes (spring forces)
    users.forEach(user => {
        const n1 = graphNodes.find(n => n.id === user.id);
        if (!n1) return;

        user.friends.forEach(friendId => {
            const n2 = graphNodes.find(n => n.id === friendId);
            if (!n2) return;

            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = (dist - springLength) * kSpring;

            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            n1.vx += fx;
            n1.vy += fy;
            n2.vx -= fx;
            n2.vy -= fy;
        });
    });

    // 3. Keep within boundaries and apply velocity/damping
    const margin = 50;
    graphNodes.forEach(node => {
        node.vx *= damping;
        node.vy *= damping;

        node.x += node.vx;
        node.y += node.vy;

        // Boundary constraint
        if (node.x < margin) { node.x = margin; node.vx = 0; }
        if (node.x > canvas.width - margin) { node.x = canvas.width - margin; node.vx = 0; }
        if (node.y < margin) { node.y = margin; node.vy = 0; }
        if (node.y > canvas.height - margin) { node.y = canvas.height - margin; node.vy = 0; }
    });
}

drawGraph = function() {
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw connections (Lines)
    ctx.lineWidth = 2;
    users.forEach(user => {
        const node1 = graphNodes.find(n => n.id === user.id);
        if (!node1) return;

        user.friends.forEach(friendId => {
            const node2 = graphNodes.find(n => n.id === friendId);
            if (!node2) return;

            // Highlight connections relating to active or hovered node
            const isActiveConnection = (node1.id === activeGraphNodeId && node2.id === hoveredNode?.id) || 
                                       (node2.id === activeGraphNodeId && node1.id === hoveredNode?.id) ||
                                       node1.id === activeGraphNodeId || node2.id === activeGraphNodeId ||
                                       node1.id === hoveredNode?.id || node2.id === hoveredNode?.id;

            ctx.strokeStyle = isActiveConnection 
                ? 'rgba(99, 102, 241, 0.6)' 
                : 'rgba(255, 255, 255, 0.08)';
            
            ctx.lineWidth = isActiveConnection ? 3 : 1.5;

            ctx.beginPath();
            ctx.moveTo(node1.x, node1.y);
            ctx.lineTo(node2.x, node2.y);
            ctx.stroke();
        });
    });

    // 2. Draw Nodes
    graphNodes.forEach(node => {
        const isActive = node.id === activeGraphNodeId;
        const isHovered = hoveredNode && node.id === hoveredNode.id;

        // Draw shadow/glow ring if active or hovered
        if (isActive || isHovered) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
            ctx.fillStyle = isActive ? 'rgba(99, 102, 241, 0.25)' : 'rgba(236, 72, 153, 0.2)';
            ctx.fill();
            
            ctx.strokeStyle = isActive ? 'rgba(99, 102, 241, 0.6)' : 'rgba(236, 72, 153, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Draw outer ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'; // Node dark background
        ctx.fill();
        ctx.strokeStyle = isActive ? '#6366f1' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = isActive ? 3 : 1.5;
        ctx.stroke();

        // Draw inner initials avatar circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius - 3, 0, Math.PI * 2);
        ctx.clip();
        
        // Linear gradient fill
        const gradient = ctx.createLinearGradient(node.x - node.radius, node.y - node.radius, node.x + node.radius, node.y + node.radius);
        if (isActive) {
            gradient.addColorStop(0, '#6366f1');
            gradient.addColorStop(1, '#a855f7');
        } else {
            gradient.addColorStop(0, '#1e293b');
            gradient.addColorStop(1, '#0f172a');
        }
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw initials text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(getInitials(node.name), node.x, node.y);
        ctx.restore();

        // Draw label text under node
        ctx.fillStyle = isActive ? '#ffffff' : '#94a3b8';
        ctx.font = isActive ? 'bold 12px "Inter", sans-serif' : '11px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.name.split(' ')[0], node.x, node.y + node.radius + 18);
    });
};

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (draggedNode) {
        draggedNode.x = mouseX;
        draggedNode.y = mouseY;
        return;
    }

    // Check if hovering over any node
    let foundHover = null;
    for (let i = 0; i < graphNodes.length; i++) {
        const node = graphNodes[i];
        const dx = node.x - mouseX;
        const dy = node.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < node.radius) {
            foundHover = node;
            break;
        }
    }

    hoveredNode = foundHover;
}

function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if dragging any node
    for (let i = 0; i < graphNodes.length; i++) {
        const node = graphNodes[i];
        const dx = node.x - mouseX;
        const dy = node.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < node.radius) {
            draggedNode = node;
            
            // Switch current user selector if clicked
            const selector = document.getElementById('user-selector');
            selector.value = node.id;
            updateSelectedPreview();
            handleGetRecommendations();
            break;
        }
    }
}

function handleMouseUp() {
    draggedNode = null;
}

function handleMouseLeave() {
    draggedNode = null;
    hoveredNode = null;
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
