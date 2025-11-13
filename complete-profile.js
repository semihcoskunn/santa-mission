const API_URL = 'https://btmzk05gh8.execute-api.eu-central-1.amazonaws.com/prod';

// Snowfall effect
function createSnowfall() {
    const snowfall = document.querySelector('.snowfall');
    if (!snowfall) return;
    
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
}

// Check if user is logged in
const userStr = localStorage.getItem('santa_user');
if (!userStr) {
    window.location.href = 'index.html';
}

const user = JSON.parse(userStr);

// Check username availability
let usernameCheckTimeout;
const usernameInput = document.getElementById('username');
const usernameError = document.getElementById('usernameError');
const usernameSuccess = document.getElementById('usernameSuccess');

usernameInput.addEventListener('input', () => {
    clearTimeout(usernameCheckTimeout);
    usernameError.style.display = 'none';
    usernameSuccess.style.display = 'none';
    
    const username = usernameInput.value.trim();
    if (username.length < 3) return;
    
    usernameCheckTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`${API_URL}/check-username?username=${username}`);
            const data = await response.json();
            
            if (data.available) {
                usernameSuccess.textContent = '✓ Kullanıcı adı müsait';
                usernameSuccess.style.display = 'block';
            } else {
                usernameError.textContent = 'Bu kullanıcı adı alınmış';
                usernameError.style.display = 'block';
            }
        } catch (error) {
            console.error('Username check error:', error);
        }
    }, 500);
});

// Form submission
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const username = document.getElementById('username').value.trim();
    const submitBtn = document.getElementById('submitBtn');
    
    if (!firstName || !lastName || !username) {
        alert('Lütfen tüm alanları doldurun');
        return;
    }
    
    if (username.length < 3 || username.length > 20) {
        usernameError.textContent = 'Kullanıcı adı 3-20 karakter olmalı';
        usernameError.style.display = 'block';
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Kaydediliyor...';
    
    try {
        const response = await fetch(`${API_URL}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.userId,
                firstName: firstName,
                lastName: lastName,
                username: username,
                email: user.email,
                photo: user.photo
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update local storage
            user.firstName = firstName;
            user.lastName = lastName;
            user.username = username;
            user.profileCompleted = true;
            localStorage.setItem('santa_user', JSON.stringify(user));
            
            window.location.href = 'index.html';
        } else {
            alert(data.error || 'Bir hata oluştu');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Devam Et';
        }
    } catch (error) {
        console.error('Profile completion error:', error);
        alert('Bir hata oluştu, lütfen tekrar deneyin');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Devam Et';
    }
});

createSnowfall();
