// profile-firebase.js
import { 
  getCurrentUserProfile, 
  updateUserProfile, 
  uploadProfilePicture,
  getUserStories,
  getUserAchievements,
  getUserProgress,
  getUserStatistics,
  saveUserStory,
  updateUserProgress,
  auth,
  db,
  storage
} from './firebase.js';

// Initialize profile page with Firebase data
export async function initializeProfilePage() {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('User not authenticated, redirecting to login');
      window.location.href = './login.html';
      return;
    }

    console.log('Loading profile data for user:', user.uid);

    // Load all profile data in parallel
    const [
      profileData,
      statistics,
      progress,
      stories,
      achievements
    ] = await Promise.all([
      getCurrentUserProfile(),
      getUserStatistics(user.uid),
      getUserProgress(user.uid),
      getUserStories(user.uid),
      getUserAchievements(user.uid)
    ]);

    // Update profile header
    updateProfileHeader(profileData, statistics);
    
    // Update progress section
    updateProgressSection(progress);
    
    // Update stories section
    updateStoriesSection(stories);
    
    // Update achievements section
    updateAchievementsSection(achievements);
    
    // Update settings form
    updateSettingsForm(profileData);

  } catch (error) {
    console.error('Error initializing profile page:', error);
    showErrorMessage('Failed to load profile data. Please try again.');
  }
}

// Update profile header
function updateProfileHeader(profileData, statistics) {
  const userNameElement = document.getElementById('userName');
  const userBioElement = document.getElementById('userBio');
  const profileImageElement = document.getElementById('profileImage');
  const modalProfileImageElement = document.getElementById('modalProfileImage');
  
  if (userNameElement) {
    userNameElement.textContent = profileData?.fullName || 'User';
  }
  
  if (userBioElement) {
    userBioElement.textContent = profileData?.bio || 'Welcome to GirlsSpace!';
  }
  
  if (profileImageElement && profileData?.photoURL) {
    profileImageElement.src = profileData.photoURL;
  }
  
  if (modalProfileImageElement && profileData?.photoURL) {
    modalProfileImageElement.src = profileData.photoURL;
  }
  
  // Update statistics
  updateStatistics(statistics);
}

// Update statistics counters
function updateStatistics(statistics) {
  const elements = {
    storiesCount: document.querySelector('.bg-white\\/5:nth-child(1) .text-2xl'),
    chatMessagesCount: document.querySelector('.bg-white\\/5:nth-child(2) .text-2xl'),
    programsCount: document.querySelector('.bg-white\\/5:nth-child(3) .text-2xl'),
    badgesCount: document.querySelector('.bg-white\\/5:nth-child(4) .text-2xl')
  };
  
  if (elements.storiesCount) {
    elements.storiesCount.textContent = statistics?.storiesCount || 0;
  }
  if (elements.chatMessagesCount) {
    elements.chatMessagesCount.textContent = statistics?.chatMessagesCount || 0;
  }
  if (elements.programsCount) {
    elements.programsCount.textContent = statistics?.programsCount || 0;
  }
  if (elements.badgesCount) {
    elements.badgesCount.textContent = statistics?.badgesCount || 0;
  }
}

// Update progress section
function updateProgressSection(progress) {
  // Update progress bars
  const progressElements = {
    englishLanguage: document.querySelector('[data-progress="englishLanguage"]'),
    lifeSkills: document.querySelector('[data-progress="lifeSkills"]'),
    gbvPrevention: document.querySelector('[data-progress="gbvPrevention"]'),
    digitalSkills: document.querySelector('[data-progress="digitalSkills"]')
  };
  
  Object.keys(progressElements).forEach(key => {
    const element = progressElements[key];
    if (element) {
      const percentage = progress?.[key] || 0;
      element.style.width = `${percentage}%`;
      element.nextElementSibling.textContent = `${percentage}%`;
    }
  });
}

// Update stories section
function updateStoriesSection(stories) {
  const storiesContainer = document.querySelector('#stories-tab .grid');
  if (!storiesContainer) return;
  
  storiesContainer.innerHTML = '';
  
  if (stories.length === 0) {
    storiesContainer.innerHTML = `
      <div class="col-span-full text-center py-8">
        <p class="text-gray-400">You haven't written any stories yet.</p>
        <a href="./stories.html?action=create" class="inline-block mt-4 text-primary hover:text-primary-dark">
          Start your first story →
        </a>
      </div>
    `;
    return;
  }
  
  stories.forEach(story => {
    const storyCard = document.createElement('div');
    storyCard.className = 'story-card bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all';
    storyCard.innerHTML = `
      <h3 class="font-bold mb-2">${story.title || 'Untitled Story'}</h3>
      <p class="text-sm text-gray-400 mb-3">${story.content?.substring(0, 100)}${story.content?.length > 100 ? '...' : ''}</p>
      <div class="flex justify-between items-center">
        <span class="text-xs text-gray-500">${story.likes || 0} likes • ${story.comments || 0} comments</span>
        <span class="text-xs ${story.status === 'published' ? 'text-primary' : 'text-yellow-500'}">${story.status || 'draft'}</span>
      </div>
    `;
    storiesContainer.appendChild(storyCard);
  });
}

// Update achievements section
function updateAchievementsSection(achievements) {
  const achievementsContainer = document.querySelector('#achievements-tab .grid');
  if (!achievementsContainer) return;
  
  // Only update if container exists and we have achievements
  if (achievements.length > 0) {
    achievementsContainer.innerHTML = achievements.map(achievement => `
      <div class="achievement-card bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-6 text-center border border-purple-500/30">
        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <i class="fas fa-${achievement.icon || 'star'} text-white text-2xl"></i>
        </div>
        <h3 class="font-bold text-lg mb-2">${achievement.title}</h3>
        <p class="text-sm text-gray-300 mb-3">${achievement.description}</p>
        <span class="text-xs text-accent font-medium">Earned: ${new Date(achievement.earnedDate).toLocaleDateString()}</span>
      </div>
    `).join('');
  }
}

// Update settings form
function updateSettingsForm(profileData) {
  const form = document.getElementById('profileForm');
  if (!form) return;
  
  // Pre-fill form with user data
  const firstNameInput = form.querySelector('input[type="text"]:nth-child(1)');
  const lastNameInput = form.querySelector('input[type="text"]:nth-child(2)');
  const emailInput = form.querySelector('input[type="email"]');
  const bioTextarea = form.querySelector('textarea');
  
  if (firstNameInput && profileData?.firstName) {
    firstNameInput.value = profileData.firstName;
  }
  
  if (lastNameInput && profileData?.lastName) {
    lastNameInput.value = profileData.lastName;
  }
  
  if (emailInput && profileData?.email) {
    emailInput.value = profileData.email;
  }
  
  if (bioTextarea && profileData?.bio) {
    bioTextarea.value = profileData.bio;
  }
  
  // Update form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const updatedData = {
      firstName: firstNameInput.value,
      lastName: lastNameInput.value,
      bio: bioTextarea.value,
      fullName: `${firstNameInput.value} ${lastNameInput.value}`.trim(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      await updateUserProfile(updatedData);
      showSuccessMessage('Profile updated successfully!');
      
      // Update UI
      const userNameElement = document.getElementById('userName');
      if (userNameElement) {
        userNameElement.textContent = updatedData.fullName;
      }
      
      const userBioElement = document.getElementById('userBio');
      if (userBioElement) {
        userBioElement.textContent = updatedData.bio;
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      showErrorMessage('Failed to update profile. Please try again.');
    }
  });
}

// Handle profile picture upload
export function setupProfilePictureUpload() {
  const imageUpload = document.getElementById('imageUpload');
  const profileImage = document.getElementById('profileImage');
  const modalProfileImage = document.getElementById('modalProfileImage');
  
  if (!imageUpload) return;
  
  imageUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showErrorMessage('File size must be less than 5MB');
      return;
    }
    
    // Check file type
    if (!file.type.match('image.*')) {
      showErrorMessage('Please select an image file');
      return;
    }
    
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      showLoading('Uploading profile picture...');
      
      // Upload to Firebase Storage
      const photoURL = await uploadProfilePicture(file, user.uid);
      
      // Update user profile with new photo URL
      await updateUserProfile({ photoURL });
      
      // Update UI
      if (profileImage) profileImage.src = photoURL;
      if (modalProfileImage) modalProfileImage.src = photoURL;
      
      showSuccessMessage('Profile picture updated successfully!');
      
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      showErrorMessage('Failed to upload profile picture. Please try again.');
    }
  });
}

// Handle edit profile modal
export function setupEditProfileModal() {
  const editProfileBtn = document.getElementById('editProfileBtn');
  const editProfileModal = document.getElementById('editProfileModal');
  const closeEditModal = document.getElementById('closeEditModal');
  const cancelEdit = document.getElementById('cancelEdit');
  const editProfileForm = document.getElementById('editProfileForm');
  
  if (!editProfileBtn || !editProfileModal) return;
  
  editProfileBtn.addEventListener('click', async () => {
    try {
      const profileData = await getCurrentUserProfile();
      if (!profileData) return;
      
      // Populate modal form
      const editFirstName = document.getElementById('editFirstName');
      const editLastName = document.getElementById('editLastName');
      const editBio = document.getElementById('editBio');
      const editLocation = document.getElementById('editLocation');
      
      if (editFirstName) editFirstName.value = profileData.firstName || '';
      if (editLastName) editLastName.value = profileData.lastName || '';
      if (editBio) editBio.value = profileData.bio || '';
      if (editLocation) editLocation.value = profileData.location || 'mahama';
      
      editProfileModal.classList.remove('hidden');
      
    } catch (error) {
      console.error('Error loading profile data:', error);
      showErrorMessage('Failed to load profile data');
    }
  });
  
  if (closeEditModal) {
    closeEditModal.addEventListener('click', () => {
      editProfileModal.classList.add('hidden');
    });
  }
  
  if (cancelEdit) {
    cancelEdit.addEventListener('click', () => {
      editProfileModal.classList.add('hidden');
    });
  }
  
  if (editProfileForm) {
    editProfileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const firstName = document.getElementById('editFirstName').value;
      const lastName = document.getElementById('editLastName').value;
      const bio = document.getElementById('editBio').value;
      const location = document.getElementById('editLocation').value;
      
      try {
        const updatedData = {
          firstName,
          lastName,
          bio,
          location,
          fullName: `${firstName} ${lastName}`.trim(),
          updatedAt: new Date().toISOString()
        };
        
        await updateUserProfile(updatedData);
        
        // Update UI
        document.getElementById('userName').textContent = updatedData.fullName;
        document.getElementById('userBio').textContent = bio;
        
        showSuccessMessage('Profile updated successfully!');
        editProfileModal.classList.add('hidden');
        
      } catch (error) {
        console.error('Error updating profile:', error);
        showErrorMessage('Failed to update profile. Please try again.');
      }
    });
  }
}

// Utility functions
function showSuccessMessage(message) {
  const toast = document.getElementById('successToast');
  if (toast) {
    toast.querySelector('span').textContent = message;
    toast.style.transform = 'translateX(0)';
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
    }, 3000);
  }
}

function showErrorMessage(message) {
  showMessage(message, 'error');
}

function showMessage(message, type = 'error') {
  // Remove existing messages
  const existingMessages = document.querySelectorAll('.custom-message');
  existingMessages.forEach(msg => msg.remove());
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `custom-message fixed top-4 left-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-medium text-center ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  }`;
  messageDiv.textContent = message;
  messageDiv.style.cssText = 'z-index: 9999;';
  
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 5000);
}

function showLoading(message) {
  // Remove existing loading indicators
  const existingLoaders = document.querySelectorAll('.loading-indicator');
  existingLoaders.forEach(loader => loader.remove());
  
  const loaderDiv = document.createElement('div');
  loaderDiv.className = 'loading-indicator fixed inset-0 bg-black/50 z-50 flex items-center justify-center';
  loaderDiv.innerHTML = `
    <div class="bg-white rounded-lg p-6 flex items-center gap-3">
      <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span class="text-gray-700">${message}</span>
    </div>
  `;
  
  document.body.appendChild(loaderDiv);
  
  return () => {
    if (loaderDiv.parentNode) {
      loaderDiv.remove();
    }
  };
}