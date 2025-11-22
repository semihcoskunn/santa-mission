const user = getCurrentUser();
if (!user) {
    window.location.href = 'index.html';
}

let userData = null;
let currentStreak = 0;
let selectedAvatar = null;

const avatars = {
    basic: ['🎅', '🎄', '⛄'],
    streak3: ['🦌', '🎁'],
    streak7: ['⭐', '🔔'],
    streak14: ['🎊', '🎉'],
    streak30: ['👑', '💎']
};

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
        
        // Avatar göster
        const avatar = userData.avatar || '🎅';
        document.getElementById('profilePhoto').textContent = avatar;
        
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
            
            // Get daily quest streak from SantaQuests
            try {
                const questsResponse = await fetch(`${API_URL}/quests?userId=${user.userId}`);
                const questsData = await questsResponse.json();
                const quests = questsData.body ? JSON.parse(questsData.body).quests : questsData.quests;
                currentStreak = quests?.currentStreak || 0;
                document.getElementById('maxStreak').textContent = currentStreak;
                loadAvatars();
            } catch (err) {
                console.error('Quests error:', err);
                document.getElementById('maxStreak').textContent = '0';
                loadAvatars();
            }
            
            // Calculate total games from leaderboard if user-stats fails
            if (userScore) {
                window.userScoreData = userScore;
            }
        } catch (err) {
            console.error('Leaderboard error:', err);
            document.getElementById('userRank').textContent = '-';
            document.getElementById('totalScore').textContent = '0';
            
            // Try to get streak even if leaderboard fails
            try {
                const questsResponse = await fetch(`${API_URL}/quests?userId=${user.userId}`);
                const questsData = await questsResponse.json();
                const quests = questsData.body ? JSON.parse(questsData.body).quests : questsData.quests;
                currentStreak = quests?.currentStreak || 0;
                document.getElementById('maxStreak').textContent = currentStreak;
                loadAvatars();
            } catch (questErr) {
                document.getElementById('maxStreak').textContent = '0';
                loadAvatars();
            }
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


// Avatar sistemi
function loadAvatars() {
    const createAvatarBtn = (emoji, unlocked) => {
        const btn = document.createElement('div');
        btn.className = 'avatar-btn';
        btn.dataset.emoji = emoji;
        btn.style.cssText = `
            width: 80px; height: 80px; border-radius: 50%; 
            display: flex; align-items: center; justify-content: center;
            font-size: 3rem; cursor: ${unlocked ? 'pointer' : 'not-allowed'};
            background: ${unlocked ? 'rgba(46, 204, 113, 0.2)' : 'rgba(0,0,0,0.1)'};
            border: 3px solid ${unlocked ? 'rgba(46, 204, 113, 0.5)' : 'rgba(0,0,0,0.2)'};
            transition: all 0.3s ease; position: relative;
            ${unlocked ? '' : 'filter: grayscale(100%); opacity: 0.5;'}
        `;
        btn.textContent = emoji;
        
        if (!unlocked) {
            const lock = document.createElement('div');
            lock.textContent = '🔒';
            lock.style.cssText = 'position: absolute; bottom: -5px; right: -5px; font-size: 1.5rem;';
            btn.appendChild(lock);
        } else {
            btn.onmouseover = () => { if (selectedAvatar !== emoji) btn.style.transform = 'scale(1.1)'; };
            btn.onmouseout = () => { if (selectedAvatar !== emoji) btn.style.transform = 'scale(1)'; };
            btn.onclick = () => selectAvatarForSave(emoji);
        }
        
        return btn;
    };
    
    document.getElementById('basicAvatars').innerHTML = '';
    avatars.basic.forEach(emoji => {
        document.getElementById('basicAvatars').appendChild(createAvatarBtn(emoji, true));
    });
    
    document.getElementById('streak3Avatars').innerHTML = '';
    avatars.streak3.forEach(emoji => {
        document.getElementById('streak3Avatars').appendChild(createAvatarBtn(emoji, currentStreak >= 3));
    });
    
    document.getElementById('streak7Avatars').innerHTML = '';
    avatars.streak7.forEach(emoji => {
        document.getElementById('streak7Avatars').appendChild(createAvatarBtn(emoji, currentStreak >= 7));
    });
    
    document.getElementById('streak14Avatars').innerHTML = '';
    avatars.streak14.forEach(emoji => {
        document.getElementById('streak14Avatars').appendChild(createAvatarBtn(emoji, currentStreak >= 14));
    });
    
    document.getElementById('streak30Avatars').innerHTML = '';
    avatars.streak30.forEach(emoji => {
        document.getElementById('streak30Avatars').appendChild(createAvatarBtn(emoji, currentStreak >= 30));
    });
}

function selectAvatarForSave(emoji) {
    selectedAvatar = emoji;
    
    // Tüm avatar butonlarını normal hale getir
    document.querySelectorAll('.avatar-btn').forEach(btn => {
        if (btn.dataset.emoji && btn.style.cursor === 'pointer') {
            btn.style.border = '3px solid rgba(46, 204, 113, 0.5)';
            btn.style.transform = 'scale(1)';
        }
    });
    
    // Seçili avatar'ı vurgula
    const selectedBtn = document.querySelector(`[data-emoji="${emoji}"]`);
    if (selectedBtn) {
        selectedBtn.style.border = '4px solid #2ecc71';
        selectedBtn.style.transform = 'scale(1.15)';
        selectedBtn.style.boxShadow = '0 8px 25px rgba(46, 204, 113, 0.5)';
    }
    
    // Kaydet butonunu aktif et
    document.getElementById('saveAvatarBtn').disabled = false;
    document.getElementById('saveAvatarBtn').style.opacity = '1';
}

async function saveSelectedAvatar() {
    if (!selectedAvatar) return;
    
    const saveBtn = document.getElementById('saveAvatarBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Kaydediliyor...';
    
    try {
        const response = await fetch(`${API_URL}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.userId,
                avatar: selectedAvatar,
                firstName: userData.firstName,
                lastName: userData.lastName,
                username: userData.username,
                email: user.email,
                photo: user.photo
            })
        });
        
        const data = await response.json();
        if (data.success || data.body) {
            document.getElementById('profilePhoto').textContent = selectedAvatar;
            document.getElementById('avatarModal').style.display = 'none';
            
            // localStorage'ı güncelle
            user.avatar = selectedAvatar;
            localStorage.setItem('santa_user', JSON.stringify(user));
            
            showToast('Avatar değiştirildi! ✅');
            selectedAvatar = null;
        }
    } catch (error) {
        console.error('Avatar update error:', error);
        showToast('Bir hata oluştu ❌', true);
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Kaydet';
    }
}


// Toast notification
function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: ${isError ? 'linear-gradient(135deg, #e74c3c, #c0392b)' : 'linear-gradient(135deg, #2ecc71, #27ae60)'};
        color: white;
        padding: 20px 30px;
        border-radius: 15px;
        font-size: 1.1rem;
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 100000;
        animation: slideInRight 0.5s ease, slideOutRight 0.5s ease 2.5s;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}

// CSS animasyonları ekle
if (!document.getElementById('toastStyles')) {
    const style = document.createElement('style');
    style.id = 'toastStyles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}
