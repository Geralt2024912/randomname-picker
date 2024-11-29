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

    pickButton.addEventListener('click', () => {
        if (remainingNames.length === 0) return;  // Only check if names are available

        // Create a new instance of Audio for each click
        const newPickSound = new Audio(pickSound.src);
        newPickSound.muted = pickSound.muted;  // Maintain mute state
        newPickSound.play();

        pendingPicks++;  // Increment pending picks counter

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
        // Process all pending picks at once
        while (pendingPicks > 0 && remainingNames.length > 0) {
            const randomIndex = Math.floor(Math.random() * remainingNames.length);
            const selectedName = remainingNames[randomIndex];

            pickedNames.push(selectedName);
            remainingNames.splice(randomIndex, 1);
            pendingPicks--;
        }

        // Update display with all picked names
        updatePickedNamesList();

        // Show the last picked name in the main display
        if (pickedNames.length > 0) {
            nameDisplay.querySelector('.name-text').textContent = pickedNames[pickedNames.length - 1];
        }

        nameDisplay.classList.add('animate');

        setTimeout(() => {
            nameDisplay.classList.remove('animate');
            isAnimating = false;
            pickButton.classList.remove('picking');
            updateButtonsVisibility();
        }, 2000);
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

    const muteButton = document.getElementById('muteButton');
    let isMuted = false;

    muteButton.addEventListener('click', () => {
        isMuted = !isMuted;
        pickSound.muted = isMuted;
        bubbleSound.muted = isMuted;
        muteButton.textContent = isMuted ? '🔇' : '🔊';

        // Add a little animation
        muteButton.style.transform = 'scale(1.2)';
        setTimeout(() => {
            muteButton.style.transform = 'scale(1)';
        }, 200);
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
});