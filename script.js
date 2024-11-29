document.addEventListener('DOMContentLoaded', () => {
    const nameDisplay = document.getElementById('nameDisplay');
    const pickButton = document.getElementById('pickButton');
    const pickSound = document.getElementById('pickSound');
    const nameList = document.getElementById('nameList');
    let isAnimating = false;
    let shuffleInterval;

    // Store the original names for restart functionality
    let originalNames = [];
    let remainingNames = [];
    let pickedNames = [];

    // Add restart button to HTML dynamically
    const restartButton = document.createElement('button');
    restartButton.id = 'restartButton';
    restartButton.textContent = 'Restart';
    restartButton.style.display = 'none'; // Hide initially
    pickButton.parentNode.insertBefore(restartButton, nameList.parentNode);

    // Initialize the names
    function initializeNames() {
        originalNames = nameList.value.split('\n').filter(name => name.trim() !== '');
        remainingNames = [...originalNames];
        updateButtonsVisibility();
    }

    // Update buttons visibility based on remaining names
    function updateButtonsVisibility() {
        pickButton.style.display = remainingNames.length > 0 ? 'inline-block' : 'none';
        restartButton.style.display = remainingNames.length < originalNames.length ? 'inline-block' : 'none';

        // Update textarea with remaining names
        nameList.value = remainingNames.join('\n');
    }

    // Initialize on load and when textarea changes
    initializeNames();
    nameList.addEventListener('input', initializeNames);

    let pendingPicks = 0;  // Add this with other global variables

    // Initialize audio context
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();

    // Create single audio instance
    const audio = new Audio('./sound.mp3');
    audio.preload = 'auto';

    const muteButton = document.getElementById('muteButton');
    let isMuted = false;

    // Move mute button handler to top level
    muteButton.addEventListener('click', (e) => {
        // Stop event propagation
        e.stopPropagation();

        // Toggle mute state
        isMuted = !isMuted;

        // Update all audio elements
        pickSound.muted = isMuted;
        bubbleSound.muted = isMuted;
        audio.muted = isMuted;  // Also mute the main audio instance

        // Update button text
        muteButton.textContent = isMuted ? '🔇' : '🔊';

        // Add animation
        muteButton.style.transform = 'scale(1.2)';
        setTimeout(() => {
            muteButton.style.transform = 'scale(1)';
        }, 200);
    });

    // Update playPickSound function to check mute state
    function playPickSound() {
        if (isMuted) return;

        // If audio is already playing, stop it
        if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
        }

        // Play new sound
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Audio play failed:", error);
            });
        }
    }

    // Update pick button click handler
    pickButton.addEventListener('click', () => {
        if (remainingNames.length === 0) return;

        playPickSound();  // Play sound first
        pendingPicks++;

        if (!isAnimating) {
            isAnimating = true;
            pickButton.classList.add('picking');

            // Quick shuffle animation
            let shuffleCount = 0;
            shuffleInterval = setInterval(() => {
                nameDisplay.querySelector('.name-text').textContent =
                    remainingNames[Math.floor(Math.random() * remainingNames.length)];
                shuffleCount++;

                if (shuffleCount === 15) {
                    clearInterval(shuffleInterval);
                    processAllPicks();
                }
            }, 200);
        }
    });

    function processAllPicks() {
        const selectedNames = [];
        const nameDisplay = document.getElementById('nameDisplay');

        // Process all pending picks
        while (pendingPicks > 0 && remainingNames.length > 0) {
            const randomIndex = Math.floor(Math.random() * remainingNames.length);
            const selectedName = remainingNames[randomIndex];
            selectedNames.push(selectedName);
            pickedNames.push(selectedName);
            remainingNames.splice(randomIndex, 1);
            pendingPicks--;
        }

        // Update picked names list
        updatePickedNamesList();

        // Keep fireworks and emoji, just clear the name-text
        const nameText = nameDisplay.querySelector('.name-text');
        nameText.textContent = '';
        nameDisplay.classList.add('animate');

        // Create container for animated names
        const namesContainer = document.createElement('div');
        namesContainer.style.display = 'flex';
        namesContainer.style.flexDirection = 'column';
        namesContainer.style.alignItems = 'center';
        namesContainer.style.gap = '10px';
        namesContainer.style.transform = 'translateY(-50px)';  // Move names up

        // Move emoji to top by changing DOM order
        const emoji = nameDisplay.querySelector('.emoji');
        nameDisplay.insertBefore(emoji, nameDisplay.firstChild);

        // Insert namesContainer after emoji
        nameDisplay.insertBefore(namesContainer, emoji.nextSibling);

        // Show all names with animation
        selectedNames.forEach(name => {
            const nameElement = document.createElement('div');
            nameElement.className = 'pop-name';
            nameElement.textContent = name;
            namesContainer.appendChild(nameElement);
        });

        // Reset after animation
        setTimeout(() => {
            nameDisplay.classList.remove('animate');
            // Only reset the name text, keep fireworks and emoji
            nameText.textContent = 'Click to Pick!';
            // Remove the names container
            namesContainer.remove();
            // Restore original DOM order
            nameDisplay.appendChild(emoji);
            isAnimating = false;
            pickButton.classList.remove('picking');
            updateButtonsVisibility();
        }, 2500);
    }

    // Restart button functionality
    restartButton.addEventListener('click', () => {
        // Play bubble sound
        bubbleSound.currentTime = 0;
        bubbleSound.play();

        // Reset remaining names to original list
        remainingNames = [...originalNames];

        // Clear picked names array
        pickedNames = [];

        // Clear the picked names display
        const pickedNamesList = document.getElementById('pickedNamesList');
        pickedNamesList.innerHTML = '';

        // Reset name display
        nameDisplay.querySelector('.name-text').textContent = 'Click to Pick!';
        nameDisplay.classList.remove('animate');

        // Show pick button, hide restart button
        pickButton.style.display = 'block';
        restartButton.style.display = 'none';

        // Update the textarea with all original names
        nameList.value = originalNames.join('\n');
    });

    // Add keyboard event listener for space bar
    document.addEventListener('keydown', (event) => {
        // Check if it's space key and button is visible and not disabled
        if (event.code === 'Space' &&
            pickButton.style.display !== 'none' &&
            !pickButton.disabled) {
            event.preventDefault(); // Prevent page scrolling
            pickSound.currentTime = 0;
            pickSound.play();
            pickButton.classList.add('active'); // Add pressed effect
            pickButton.click(); // Trigger the pick button click
        }
    });

    // Remove the pressed effect when space is released
    document.addEventListener('keyup', (event) => {
        if (event.code === 'Space') {
            pickButton.classList.remove('active');
        }
    });

    // Update keyboard event listener for Escape key
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Escape') {
            event.preventDefault();

            // Stop all animations and processes
            clearInterval(shuffleInterval);
            isAnimating = false;
            pickButton.disabled = false;
            pickButton.classList.remove('picking');
            nameDisplay.classList.remove('animate');
            nameDisplay.querySelector('.name-text').textContent = 'Click to Pick!';

            // Reset sound
            pickSound.pause();
            pickSound.currentTime = 0;

            // Reset pending picks
            pendingPicks = 0;
        }
    });

    // Add keyboard event listener for Backspace key
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Backspace' &&
            restartButton.style.display !== 'none' &&
            !event.target.matches('textarea, input')) {  // Prevent when typing in textarea
            event.preventDefault();
            restartButton.click();  // Trigger restart button functionality
        }
    });

    // Add this new function to update the picked names display
    function updatePickedNamesList() {
        const pickedNamesList = document.getElementById('pickedNamesList');
        pickedNamesList.innerHTML = ''; // Clear current list

        pickedNames.forEach((name, index) => {
            const nameDiv = document.createElement('div');
            nameDiv.textContent = `${index + 1}. ${name}`;
            pickedNamesList.appendChild(nameDiv);
        });
    }

    // Initialize audio on first user interaction
    document.addEventListener('touchstart', function initAudio() {
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
        }).catch(error => {
            console.log("Audio initialization failed:", error);
        });
        document.removeEventListener('touchstart', initAudio);
    }, false);
});