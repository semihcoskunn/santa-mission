const user = getCurrentUser();
if (!user) {
    window.location.href = 'index.html';
}

let userData = null;

// Load user data
async function loadProfile() {
    try {
        console.log('Loading profile for userId:', user.userId);
        const response = await fetch(`${API_URL}/user?userId=${user.userId}`);
        console.log('Response status:', response.status);
        
        const rawData = await response.json();
        console.log('Raw data:', rawData);
        
        // API Gateway returns Lambda response with body field
        if (rawData.body) {
            userData = JSON.parse(rawData.body);
        } else {
            userData = rawData;
        }
        
        console.log('User data:', userData);
        console.log('firstName:', userData.firstName);
        console.log('lastName:', userData.lastName);
        console.log('username:', userData.username);
        
        const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
        console.log('Full name:', fullName);
        
        document.getElementById('profilePhoto').src = user.photo || '';
        document.getElementById('profileName').textContent = fullName || user.name || 'Kullanıcı';
        document.getElementById('profileUsername').textContent = `@${userData.username || 'username'}`;
        document.getElementById('profileEmail').textContent = user.email || 'Email yok';
        
        console.log('Profile UI updated successfully');
        
        // Get leaderboard data
        console.log('Loading leaderboard...');
        try {
            const scoresResponse = await fetch(`${API_URL}/leaderboard`);
            console.log('Leaderboard response status:', scoresResponse.status);
            let scoresData = await scoresResponse.json();
            
            if (scoresData.body) {
                scoresData = JSON.parse(scoresData.body);
            }
            
            console.log('Leaderboard data:', scoresData);
            const leaderboard = scoresData.leaderboard || [];
            console.log('Leaderboard array length:', leaderboard.length);
            
            // Find user rank
            const userRank = leaderboard.findIndex(u => u.userID === user.userId) + 1;
            const userScore = leaderboard.find(u => u.userID === user.userId);
            console.log('User rank:', userRank, 'User score:', userScore);
            
            document.getElementById('userRank').textContent = userRank > 0 ? `#${userRank}` : '-';
            document.getElementById('totalScore').textContent = userScore?.total_score || 0;
            document.getElementById('maxStreak').textContent = userScore?.max_streak || 0;
            
            // Calculate total games from leaderboard if user-stats fails
            if (userScore) {
                window.userScoreData = userScore;
            }
        } catch (err) {
            console.error('Leaderboard error:', err);
            document.getElementById('userRank').textContent = '-';
            document.getElementById('totalScore').textContent = '0';
            document.getElementById('maxStreak').textContent = '0';
        }
        
        
        // Check if profile can be edited (profileEdited flag)
        if (userData.profileEdited) {
            document.getElementById('editBtn').style.display = 'none';
        }
    } catch (error) {
        console.error('Profile load error:', error);
        document.getElementById('profileName').textContent = 'Hata: ' + error.message;
    }
}

// Edit button
document.getElementById('editBtn').addEventListener('click', () => {
    document.getElementById('editSection').style.display = 'block';
    document.getElementById('editBtn').style.display = 'none';
    
    document.getElementById('editFirstName').value = userData.firstName || '';
    document.getElementById('editLastName').value = userData.lastName || '';
    document.getElementById('editUsername').value = userData.username || '';
});

// Cancel button
document.getElementById('cancelBtn').addEventListener('click', () => {
    document.getElementById('editSection').style.display = 'none';
    document.getElementById('editBtn').style.display = 'inline-block';
});

// Username check
let usernameTimeout;
document.getElementById('editUsername').addEventListener('input', (e) => {
    clearTimeout(usernameTimeout);
    const username = e.target.value.trim();
    const check = document.getElementById('usernameCheck');
    
    if (username === userData.username) {
        check.textContent = '';
        return;
    }
    
    if (username.length < 3) {
        check.textContent = '';
        return;
    }
    
    usernameTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`${API_URL}/check-username?username=${username}`);
            let data = await response.json();
            
            if (data.body) {
                data = JSON.parse(data.body);
            }
            
            if (data.available) {
                check.textContent = '✓ Kullanıcı adı müsait';
                check.style.color = '#27ae60';
            } else {
                check.textContent = '✗ Bu kullanıcı adı alınmış';
                check.style.color = '#dc3545';
            }
        } catch (error) {
            console.error('Username check error:', error);
        }
    }, 500);
});

// Save button
document.getElementById('saveBtn').addEventListener('click', async () => {
    const firstName = document.getElementById('editFirstName').value.trim();
    const lastName = document.getElementById('editLastName').value.trim();
    const username = document.getElementById('editUsername').value.trim();
    
    if (!firstName || !lastName || !username) {
        alert('Lütfen tüm alanları doldurun');
        return;
    }
    
    if (username.length < 3) {
        alert('Kullanıcı adı en az 3 karakter olmalı');
        return;
    }
    
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Kaydediliyor...';
    
    try {
        const response = await fetch(`${API_URL}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.userId,
                firstName,
                lastName,
                username,
                email: user.email,
                photo: user.photo,
                profileEdited: true
            })
        });
        
        let data = await response.json();
        
        if (data.body) {
            data = JSON.parse(data.body);
        }
        
        console.log('Save response:', data);
        
        if (data.success) {
            alert('Profil güncellendi! Artık bilgilerinizi değiştiremezsiniz.');
            location.reload();
        } else {
            alert(data.error || 'Bir hata oluştu');
            saveBtn.disabled = false;
            saveBtn.textContent = 'Kaydet';
        }
    } catch (error) {
        console.error('Save error:', error);
        alert('Bir hata oluştu');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Kaydet';
    }
});

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

loadProfile();
