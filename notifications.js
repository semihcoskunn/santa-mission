const user = getCurrentUser();
if (!user) {
    window.location.href = 'index.html';
}

// Update login button
const loginBtn = document.getElementById('loginBtn');
if (loginBtn && user) {
    const fullName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name;
    loginBtn.textContent = fullName;
    loginBtn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
    loginBtn.onclick = () => window.location.href = 'profile.html';
}

// Snowfall
const snowfall = document.querySelector('.snowfall');
const snowflakeTypes = ['❄', '❅', '✻'];
for (let i = 0; i < 80; i++) {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.textContent = snowflakeTypes[i % 3];
    snowflake.style.left = Math.random() * 100 + '%';
    snowflake.style.animationDuration = (Math.random() * 8 + 6) + 's';
    snowflake.style.animationDelay = '0s';
    snowflake.style.fontSize = (Math.random() * 10 + 15) + 'px';
    snowflake.style.opacity = Math.random() * 0.6 + 0.3;
    snowfall.appendChild(snowflake);
}
